# Secret Rotation Required

The following material was previously tracked by Git and must be treated as exposed:

- JWT secret from `.env.docker`.
- PostgreSQL password from `.env.docker`.
- MinIO root password from `.env.docker`.
- Midtrans server/client keys from `.env.docker` and mobile environment files.
- Android release keystore and its hardcoded store/key passwords.

## Required actions outside this repository

1. Rotate the JWT secret and invalidate existing sessions at an approved maintenance time.
2. Rotate PostgreSQL and MinIO credentials, then update the deployment secret store.
3. Rotate Midtrans credentials in the Midtrans dashboard and deployment secret store.
4. Generate a new Android upload/release key if Play/App signing policy permits it. Follow the
   relevant Play Console key-reset procedure when the app is already published.
5. Purge historical secrets with an approved history-rewrite process only after coordinating with
   every clone and deployment source.
6. Store production values in CI/CD or infrastructure secret management, never in tracked files.

Removing files in the current branch does not remove values from existing Git history.
