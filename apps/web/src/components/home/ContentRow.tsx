import { ContentCard } from './ContentCard';
import type { Content } from '@/types';

interface ContentRowProps {
  title: string;
  contents: Content[];
}

export function ContentRow({ title, contents }: ContentRowProps) {
  if (!contents || contents.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4 px-4">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 px-4">
        {contents.map((content) => (
          <ContentCard key={content.id} content={content} />
        ))}
      </div>
    </section>
  );
}

