import bcrypt from 'bcryptjs';
import { randomBytes, randomUUID } from 'node:crypto';
import { unlink } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import prisma from '../config/database.js';

type WorkerOptions = {
  dryRun?: boolean;
  now?: Date;
  limit?: number;
  requestIds?: string[];
};

export type DeletionWorkerResult = {
  dry_run: boolean;
  policy_version: string | null;
  eligible: number;
  completed: number;
  failed: number;
};

function requireExecutionApproval(): string {
  if (process.env.ACCOUNT_DELETION_EXECUTION_ENABLED !== 'true') {
    throw new Error('Account deletion execution is disabled');
  }
  const policyVersion = process.env.ACCOUNT_DELETION_POLICY_VERSION?.trim();
  if (!policyVersion) {
    throw new Error('ACCOUNT_DELETION_POLICY_VERSION must be approved and configured');
  }
  return policyVersion;
}

function attachmentPathFromUrl(url: string | null): string | null {
  const prefix = '/api/uploads/support/';
  if (!url?.startsWith(prefix)) return null;
  const filename = path.basename(url);
  if (!/^[0-9a-f-]+\.(jpg|png|webp|pdf)$/i.test(filename)) return null;
  return path.join(process.env.UPLOADS_PATH || '/app/uploads', 'support', filename);
}

export async function runAccountDeletionWorker(
  options: WorkerOptions = {},
): Promise<DeletionWorkerResult> {
  const now = options.now || new Date();
  const limit = Math.min(Math.max(options.limit || 50, 1), 500);
  const dryRun = options.dryRun ?? process.env.ACCOUNT_DELETION_WORKER_MODE !== 'execute';
  const policyVersion = dryRun ? null : requireExecutionApproval();
  const candidates = await prisma.accountDeletionRequest.findMany({
    where: {
      status: 'PENDING',
      scheduled_for: { lte: now },
      ...(options.requestIds?.length ? { id: { in: options.requestIds } } : {}),
    },
    orderBy: { scheduled_for: 'asc' },
    take: limit,
    select: { id: true, user_id: true },
  });

  if (dryRun) {
    return {
      dry_run: true,
      policy_version: null,
      eligible: candidates.length,
      completed: 0,
      failed: 0,
    };
  }

  let completed = 0;
  let failed = 0;
  for (const candidate of candidates) {
    const claimed = await prisma.accountDeletionRequest.updateMany({
      where: { id: candidate.id, status: 'PENDING', scheduled_for: { lte: now } },
      data: { status: 'PROCESSING', processing_started_at: now, failure_reason: null },
    });
    if (claimed.count !== 1) continue;

    try {
      const user = await prisma.user.findUniqueOrThrow({
        where: { id: candidate.user_id },
        select: { email: true },
      });
      const supportTickets = await prisma.supportTicket.findMany({
        where: {
          OR: [
            { user_id: candidate.user_id },
            ...(user.email
              ? [{ email: { equals: user.email, mode: 'insensitive' as const } }]
              : []),
          ],
        },
        select: { id: true, attachment_url: true },
      });
      const anonymousEmail = `deleted-${randomUUID()}@deleted.invalid`;
      const passwordHash = await bcrypt.hash(randomBytes(32).toString('hex'), 10);

      await prisma.$transaction(async (tx) => {
        await tx.watchlist.deleteMany({ where: { user_id: candidate.user_id } });
        await tx.watchProgress.deleteMany({ where: { user_id: candidate.user_id } });
        await tx.otpChallenge.deleteMany({ where: { user_id: candidate.user_id } });
        await tx.socialIdentity.deleteMany({ where: { user_id: candidate.user_id } });
        await tx.authSession.updateMany({
          where: { user_id: candidate.user_id, revoked_at: null },
          data: { revoked_at: now },
        });
        await tx.legalConsent.updateMany({
          where: { user_id: candidate.user_id },
          data: { user_agent: null },
        });
        await tx.supportTicket.updateMany({
          where: { id: { in: supportTickets.map((ticket) => ticket.id) } },
          data: {
            user_id: null,
            name: 'Deleted user',
            email: anonymousEmail,
            phone: null,
            transaction_number: null,
            subject: '[Removed following account deletion]',
            message: '[Removed following account deletion]',
            attachment_url: null,
          },
        });
        await tx.user.update({
          where: { id: candidate.user_id },
          data: {
            email: anonymousEmail,
            email_normalized: anonymousEmail,
            email_verified_at: null,
            username: null,
            username_normalized: null,
            phone_e164: null,
            phone_verified_at: null,
            account_status: 'DELETED',
            password_hash: passwordHash,
            full_name: null,
            avatar_url: null,
            local_avatar_url: null,
            deleted_at: now,
          },
        });
        await tx.accountDeletionRequest.update({
          where: { id: candidate.id },
          data: {
            status: 'COMPLETED',
            completed_at: now,
            failure_reason: null,
          },
        });
        await tx.complianceAuditLog.create({
          data: {
            user_id: candidate.user_id,
            event_type: 'ACCOUNT_DELETION_COMPLETED',
            subject_type: 'ACCOUNT_DELETION_REQUEST',
            subject_id: candidate.id,
            source_platform: 'worker',
            metadata: {
              policy_version: policyVersion,
              preserved_records: ['transactions', 'rentals', 'entitlements', 'audit_logs'],
              removed_records: ['profile_identifiers', 'watchlist', 'watch_progress'],
            },
          },
        });
      });

      await Promise.all(supportTickets.map(async (ticket) => {
        const filePath = attachmentPathFromUrl(ticket.attachment_url);
        if (filePath) await unlink(filePath).catch(() => undefined);
      }));
      completed += 1;
    } catch {
      failed += 1;
      await prisma.accountDeletionRequest.updateMany({
        where: { id: candidate.id, status: 'PROCESSING' },
        data: { status: 'FAILED', failure_reason: 'ANONYMIZATION_FAILED' },
      });
    }
  }

  return {
    dry_run: false,
    policy_version: policyVersion,
    eligible: candidates.length,
    completed,
    failed,
  };
}

async function main(): Promise<void> {
  const result = await runAccountDeletionWorker();
  console.log(JSON.stringify(result));
  await prisma.$disconnect();
}

const isMainModule = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false;

if (isMainModule) {
  main().catch(async (error) => {
    console.error(error instanceof Error ? error.message : 'Account deletion worker failed');
    await prisma.$disconnect();
    process.exit(1);
  });
}
