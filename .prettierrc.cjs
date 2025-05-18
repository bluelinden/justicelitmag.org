/** @type {import('prettier').Config} */
const prettierConfig = {
	"useTabs": true,
	"singleQuote": true,
	"trailingComma": "none",
	"printWidth": 100,
	// "plugins": [require.resolve("prettier-plugin-tailwindcss"), require.resolve("prettier-plugin-vue"), require.resolve("prettier-plugin-astro"),  ],
	// "pluginSearchDirs": ["."],
	"overrides": [{ "files": "*.svelte", "options": { "parser": "svelte" } }]
}

module.exports = prettierConfig;
