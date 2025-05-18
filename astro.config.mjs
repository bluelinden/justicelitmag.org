import { defineConfig } from 'astro/config';

import tailwind from '@astrojs/tailwind';

import vue from '@astrojs/vue';
import pagefind from 'astro-pagefind';

import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';

import keystatic from '@keystatic/astro'

// import devtoolBreadpoints from 'astro-devtool-breakpoints'

// import astroFuse from 'astro-fuse';
// 
// 
// console.log(import.meta.env.DEV)

// https://astro.build/config
export default defineConfig({
    integrations: [tailwind(), vue({
        template: {
            compilerOptions: {
                // treat all tags with a dash as custom elements
                isCustomElement: (tag) => tag.includes('-')
            }
        }
		}), pagefind(), react(), markdoc(), ...(import.meta.env.DEV ? [keystatic()] : [])],
    build: {
        rollupOptions: {
            external: [""]
        }
    },
    site: 'https://justicelitmag.org'
});