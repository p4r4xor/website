import { Feed } from '@nullptrs/feed';
import { slugsToMetadata } from './metadata.const';

const feed = new Feed({
	title: 'paraxor.dev',
	id: process.env.SITE_URL ?? '',
	link: process.env.SITE_URL ?? 'https://paraxor.dev',
	favicon: `${process.env.SITE_URL ?? 'https://paraxor.dev'}/favicon.ico`,
	language: 'en',
	copyright: 'CC BY-NC-SA 4.0',
	feedLinks: {
		atom: `${process.env.SITE_URL ?? 'https://paraxor.dev'}/feed.atom`,
		json: `${process.env.SITE_URL ?? 'https://paraxor.dev'}/feed.json`,
		rss: `${process.env.SITE_URL ?? 'https://paraxor.dev'}/feed.rss`,
	},
});

Object.values(slugsToMetadata)
	.filter(post => !post.frontmatter.hidden)
	.forEach(post => {
		const { frontmatter: postData } = post;
		if (!feed.items.find(item => item.id === postData.slug)) {
			feed.addItem({
				title: postData.name,
				id: postData.slug,
				link: `${process.env.SITE_URL ?? 'https://paraxor.dev'}/${postData.slug}`,
				content: postData.excerpt,
				date: new Date(postData.date),
				author: [
					{
						name: postData.author,
					},
				],
			});
		}
	});

export const rss2 = feed.rss2();
export const atom1 = feed.atom1();
export const json1 = feed.json1();
