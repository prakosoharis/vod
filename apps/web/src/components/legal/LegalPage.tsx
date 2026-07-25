import { useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/navbar/Logo';

type Section = { title: string; content: ReactNode };

interface LegalPageProps {
  title: string;
  description: string;
  path: string;
  updated?: string;
  children?: ReactNode;
  sections?: Section[];
}

export const LEGAL_REVIEW_NOTICE =
  'Draf ini wajib ditinjau dan disetujui penasihat hukum Indonesia sebelum digunakan sebagai naskah legal final.';

export function LegalPage({
  title,
  description,
  path,
  updated = '25 Juli 2026',
  children,
  sections = [],
}: LegalPageProps) {
  useEffect(() => {
    document.title = `${title} | SMASHSTREAM`;
    const ensureMeta = (selector: string, attributes: Record<string, string>) => {
      let element = document.head.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null;
      if (!element) {
        element = document.createElement(attributes.rel ? 'link' : 'meta');
        document.head.appendChild(element);
      }
      Object.entries(attributes).forEach(([key, value]) => element?.setAttribute(key, value));
    };
    ensureMeta('meta[name="description"]', { name: 'description', content: description });
    ensureMeta('link[rel="canonical"]', { rel: 'canonical', href: `https://smashstream.id${path}` });
  }, [description, path, title]);

  return (
    <div className="min-h-screen bg-warm-charcoal-100 text-cream-50">
      <header className="border-b border-cream-50/10 bg-warm-charcoal-50/95 px-5 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link to="/" aria-label="Kembali ke beranda"><Logo /></Link>
          <Link className="text-sm text-accent-400 hover:text-accent-300" to="/">Kembali ke SMASHSTREAM</Link>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-5 py-12 md:py-16">
        <p className="mb-3 text-xs font-bold tracking-[0.24em] text-accent-400">PUSAT LEGAL & DUKUNGAN</p>
        <h1 className="text-3xl font-extrabold md:text-5xl">{title}</h1>
        <p className="mt-4 text-cream-200">{description}</p>
        <div className="mt-5 flex flex-wrap gap-3 text-xs text-cream-200">
          <span className="rounded-full border border-amber-400/30 px-3 py-1 text-amber-100">Status: Draf—belum berlaku</span>
          <span className="rounded-full border border-cream-50/10 px-3 py-1">Draf diperbarui: {updated}</span>
          <span className="rounded-full border border-cream-50/10 px-3 py-1">Versi draf: 2026-07-25</span>
        </div>
        <div className="mt-8 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
          <strong>Catatan peninjauan:</strong> {LEGAL_REVIEW_NOTICE}
        </div>
        {children}
        {sections.map((section, index) => (
          <section className="legal-copy mt-10" key={section.title}>
            <h2 className="text-xl font-bold md:text-2xl">{index + 1}. {section.title}</h2>
            <div className="mt-3 space-y-3 leading-7 text-cream-100">{section.content}</div>
          </section>
        ))}
      </main>
    </div>
  );
}
