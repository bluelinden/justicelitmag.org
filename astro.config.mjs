import { defineConfig } from 'astro/config';

import tailwind from '@astrojs/tailwind';

import devtoolBreadpoints from 'astro-devtool-breakpoints'

import astroFuse from 'astro-fuse';

// https://astro.build/config
export default defineConfig({
	integrations: [tailwind(), devtoolBreadpoints(), astroFuse()]
});
