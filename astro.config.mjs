import { defineConfig } from 'astro/config';

import vue from '@astrojs/vue';

import markdoc from '@astrojs/markdoc';
import react from '@astrojs/react';

import keystatic from '@keystatic/astro';

import tailwind from '@tailwindcss/vite';

import showTailwindcssBreakpoint from 'astro-show-tailwindcss-breakpoint';

import ViteYaml from '@modyfi/vite-plugin-yaml';

import collectionSearch from 'astro-collection-search';

// import devtoolBreadpoints from 'astro-devtool-breakpoints'

// import astroFuse from 'astro-fuse';
//
//
// console.log(import.meta.env.DEV)

// https://astro.build/config
export default defineConfig({
	integrations: [
		vue({
			template: {
				compilerOptions: {
					// treat all tags with a dash as custom elements
					isCustomElement: (tag) => tag.includes('-')
				}
			}
		}),
		react(),
		markdoc(),
		...(import.meta.env.DEV ? [keystatic()] : []),
		showTailwindcssBreakpoint(),
		collectionSearch({
			collections: ['spreads2025', 'authors2025', 'works2025'],
			fields: ['name', 'title', 'numL', 'numR', 'authors', 'description', 'works', 'position'],
			contentDirectory: 'content',
			customRegex: /\.mdoc$/i
		})
	],
	build: {
		rollupOptions: {
			external: ['']
		}
	},
	vite: {
		plugins: [tailwind(), ViteYaml()]
	},
	site: 'https://justicelitmag.org'
});
