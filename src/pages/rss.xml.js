import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import config from '../data/config.json';
//this is the function that will be called when the page is requested, it will return the rss feed
export async function GET(context) {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  return rss({
    title: `${config.author} — Blog`,
    description: `Latest posts from ${config.author}'s blog.`,
    site: context.site,
    items: posts
      .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
      .map(post => ({
        title: post.data.title,
        pubDate: post.data.date,
        description: post.data.description,
        link: `/blog/${post.slug}/`,
      })),
  });
}
