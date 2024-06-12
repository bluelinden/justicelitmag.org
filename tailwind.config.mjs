import tailwindCSSImageRendering from 'tailwindcss-image-rendering';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				lmp: {
					100: '#c4abc1',
					900: '#4f345a'
				},
				lmr: '#4c1a22',
				lmg: {
					100: '#afd897',
					900: '#0f432d'
				},
				ybk: {
					blue: "#4fc6f4",
					pink: "#f68aca"
				}
			},
			fontFamily: {
				serif: 'Young Serif',
				slab: 'Rokkitt'
			},
			aspectRatio: {
				paper: "2.977 / 4",
			}
		}
	},
	plugins: [tailwindCSSImageRendering()]
};
