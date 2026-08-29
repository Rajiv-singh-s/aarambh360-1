import fs from 'fs';
import path from 'path';

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: 'Prelims' | 'Mains' | 'Strategy' | 'Current Affairs' | 'NCERT';
  publishedAt: string;
  readTime: string;
  featured?: boolean;
  content: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
}

const blogsDirectory = path.join(process.cwd(), 'content', 'blogs');

export function getAllBlogSlugs(): string[] {
  if (!fs.existsSync(blogsDirectory)) return [];
  const fileNames = fs.readdirSync(blogsDirectory);
  return fileNames
    .filter(name => name.endsWith('.md'))
    .map(name => name.replace(/\.md$/, ''));
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  const fullPath = path.join(blogsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return undefined;

  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Simple, robust frontmatter parser
  const match = fileContents.match(/^---([\s\S]*?)---([\s\S]*)$/);
  if (!match) return undefined;

  const frontmatterStr = match[1];
  const content = match[2].trim();

  const metadata: Record<string, any> = {};
  frontmatterStr.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      const key = line.slice(0, colonIndex).trim();
      let value: any = line.slice(colonIndex + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      } else if (value.startsWith('[') && value.endsWith(']')) {
        try {
          value = JSON.parse(value);
        } catch {
          value = value.slice(1, -1).split(',').map((s: string) => s.trim().replace(/^["']|["']$/g, ''));
        }
      } else if (value === 'true') {
        value = true;
      } else if (value === 'false') {
        value = false;
      }
      metadata[key] = value;
    }
  });

  return {
    slug: metadata.slug || slug,
    title: metadata.title || 'UPSC CSE Article',
    excerpt: metadata.excerpt || '',
    category: metadata.category || 'Strategy',
    publishedAt: metadata.publishedAt || 'August 2026',
    readTime: metadata.readTime || '5 min read',
    featured: metadata.featured || false,
    tags: Array.isArray(metadata.tags) ? metadata.tags : ['UPSC', 'IAS'],
    metaTitle: metadata.metaTitle || metadata.title || 'UPSC CSE Guide | Aarambh360',
    metaDescription: metadata.metaDescription || metadata.excerpt || 'UPSC CSE Civil Services Preparation Guide and Notes.',
    content
  };
}

export function getAllBlogPosts(): BlogPost[] {
  const slugs = getAllBlogSlugs();
  const posts = slugs
    .map(slug => getBlogPostBySlug(slug))
    .filter((post): post is BlogPost => post !== undefined);

  return posts;
}
