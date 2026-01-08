import { glob } from 'astro/loaders';
import { defineCollection, reference } from 'astro:content';
import { z } from 'zod';

const pages2024 = defineCollection({
	loader: glob({ pattern: '[^_]*.{md,mdx}', base: './content/pages2024' }),
	schema: z.object({
		title: z.string(),
		next: z.optional(reference('pages2024')),
		prev: z.optional(reference('pages2024')),
		authors: z.array(reference('authors2024')).optional(),
		number: z.number().optional(),
		description: z.string().optional(),
		img: z.string().optional(),
		'show-credits': z.boolean().optional()
	})
});

const authors2024 = defineCollection({
	loader: glob({ pattern: '[^_]*.{md,mdx}', base: './content/authors2024' }),
	schema: z.object({
		name: z.string(),
		'editorial-position': z.string().optional(),
		works: z.array(
			z.object({
				title: z.string(),
				page: reference('pages2024')
			})
		)
	})
});

export const spreads2025Schema = z.object({
	title: z.string(),
	works: z.optional(z.array(reference('works2025'))),
	// numbers: z.object({
	numL: z.number().optional(),
	numR: z.number().optional(),
	// }),
	// images: z.object({
	imgL: z.string().optional(),
	imgR: z.string().optional(),
	// }),

	display: z.enum(['webCredits', 'pageJump']).array()
});

const spreads2025 = defineCollection({
	loader: glob({ pattern: '[^_]*.{md,mdx,mdoc}', base: './content/spreads2025' }),
	schema: spreads2025Schema
});

export const works2025Schema = z.object({
	title: z.string(),
	authors: z.optional(z.array(reference('authors2025'))),
});

const works2025 = defineCollection({
	loader: glob({ pattern: '[^_]*.{md,mdx,mdoc}', base: './content/works2025' }),
	schema: works2025Schema
});

export const authors2025Schema = z.object({
	name: z.string(),
	position: z.string().optional()
});

const authors2025 = defineCollection({
	loader: glob({ pattern: '[^_]*.{md,mdx,mdoc}', base: './content/authors2025' }),
	schema: authors2025Schema
});

export const collections = { authors2024, pages2024, spreads2025, authors2025, works2025 };
