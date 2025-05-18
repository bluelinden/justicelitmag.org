import { defineConfig } from 'astro/config';

import vue from '@astrojs/vue';
import pagefind from 'astro-pagefind';

import markdoc from '@astrojs/markdoc';
import react from '@astrojs/react';

import keystatic from '@keystatic/astro';

import tailwind from '@tailwindcss/vite';

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
		pagefind(),
		react(),
		markdoc(),
		...(import.meta.env.DEV ? [keystatic()] : [])
	],
	build: {
		rollupOptions: {
			external: ['']
		}
	},
	vite: {
		plugins: [tailwind()]
	},
	site: 'https://justicelitmag.org'
});
