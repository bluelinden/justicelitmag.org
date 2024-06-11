import { z, defineCollection, reference } from 'astro:content';

const pages2024 = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		next: z.optional(reference('pages2024')),
		prev: z.optional(reference('pages2024')),
		authors: z.z.array(reference('authors2024')).optional(),
		number: z.number().optional(),
		description: z.string().optional(),
		img: z.string().optional(),
		show_credits: z.boolean().optional()
	})
});

const authors2024 = defineCollection({
	type: 'content',
	schema: z.object({
		name: z.string(),
		pages: z.array(reference('pages2024'))
	})
});

export const collections = { authors2024, pages2024 };
