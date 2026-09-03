import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const achievements = defineCollection({
	loader: glob({ pattern: '**/*.mdx', base: './src/content/achievements' }),
	schema: z.object({
		year: z.number(),
		title: z.string(),
		result: z.string(),
		description: z.string(),
		// Link to the event/competition's official website.
		event_website: z.string().url().optional(),
		// A freely-labeled extra link, e.g. an interview, results page, or submitted work.
		// Written using markdown link syntax: [表示テキスト](https://example.com)
		link: z
			.string()
			.regex(/^\[.+\]\(\S+\)$/, 'Use markdown link syntax: [表示テキスト](https://example.com)')
			.optional(),
		// "YYYY-MM-DD" for a specific day, or "YYYY-MM" for month precision.
		startDate: z
			.string()
			.regex(/^\d{4}-\d{2}(-\d{2})?$/)
			.optional(),
		// Only needed when the achievement spans more than one day/month.
		endDate: z
			.string()
			.regex(/^\d{4}-\d{2}(-\d{2})?$/)
			.optional(),
	}),
});

const blog = defineCollection({
	loader: glob({ pattern: '**/*.mdx', base: './src/content/blog' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		// Accepts either a quoted "YYYY-MM-DD" string or a bare YAML date.
		pubDate: z.coerce.date(),
		tags: z.array(z.string()).default([]),
	}),
});

const materials = defineCollection({
	loader: glob({ pattern: '**/*.mdx', base: './src/content/materials' }),
	schema: z.object({
		title: z.string(),
		// The contest, hackathon, or presentation/exhibition this material is from.
		event: z.string(),
		// Accepts either a quoted "YYYY-MM-DD" string or a bare YAML date.
		date: z.coerce.date(),
		description: z.string().optional(),
		// Each file/link shown as a button, e.g. a slide deck PDF or a project's LP.
		files: z
			.array(
				z.object({
					label: z.string(),
					url: z.string(),
				}),
			)
			.min(1),
	}),
});

const events = defineCollection({
	loader: glob({ pattern: '**/*.mdx', base: './src/content/events' }),
	schema: z.object({
		name: z.string(),
	}),
});

const competitions = defineCollection({
	loader: glob({ pattern: '**/*.mdx', base: './src/content/competitions' }),
	schema: z.object({
		name: z.string(),
	}),
});

export const collections = { achievements, blog, events, competitions, materials };
