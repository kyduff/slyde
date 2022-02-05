import fs from 'fs';
import { join } from 'path';
import matter from 'gray-matter';
import markdownToHtml from './markdownToHtml';

const guidesDir = join(process.cwd(), '_guides');

export function getGuideSlugs() {
  return fs.readdirSync(guidesDir);
}

export function getGuideBySlug(slug, fields = []) {
  const realSlug = slug.replace(/\.md$/, '');
  const fullPath = join(guidesDir, `${realSlug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  const items = {};

  fields.forEach((field) => {
    if (field === 'slug') {
      items[field] = realSlug;
    }
    if (field === 'content') {
      items[field] = content;
    }

    if (typeof data[field] !== 'undefined') {
      items[field] = data[field];
    }
  })

  return items;
}

export function getAllGuides(fields = []) {
  const slugs = getGuideSlugs();
  const guides = slugs.map(slug => getGuideBySlug(slug, fields))
  return guides;
}