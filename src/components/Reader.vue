<script setup lang="ts">
import type { spreads2025Schema, authors2025Schema, works2025Schema } from '../content.config';
import { z } from 'zod';
import {
	themeFromImage,
	applyTheme,
	type Theme,
	themeFromSourceColor
} from '@material/material-color-utilities';
import {
	IconArrowBackRounded,
	IconArrowForwardRounded,
	IconGroupRounded,
	IconAddRounded,
	IconRemoveRounded,
	IconBuildRounded,
	IconSearchRounded,
	IconBookRounded
} from '@iconify-prerendered/vue-material-symbols';
import { MdDialog } from '@material/web/dialog/dialog.js';
import 'v-onboarding/dist/style.css';
import '@material/web/all.js';
import '@maicol07/material-web-additions/snackbar/snackbar.js';

import { Search, type CollectionSearchResult } from 'astro-collection-search/self';

import Highlighter from 'vue-highlight-words';

import MagSettings from '../../content/settings2025.yaml';

import { computedAsync } from '@vueuse/core';

const props = defineProps<{
	currentPage: number;
	pages: Array<
		[
			number,
			{
				id: string;
				body?: string;
				collection: 'spreads2025';
				rendered: any;
				digest: string;
				data: z.infer<typeof spreads2025Schema>;
			}
		]
	>;
	authors: Array<
		[
			number,
			{
				id: string;
				body?: string;
				collection: 'authors2025';
				rendered: any;
				digest: string;
				data: z.infer<typeof authors2025Schema>;
			}
		]
	>;
	works: Array<
		[
			number,
			{
				id: string;
				body?: string;
				collection: 'works2025';
				rendered: any;
				digest: string;
				data: z.infer<typeof works2025Schema>;
			}
		]
	>;
	dev: boolean;
}>();

function debounce(func: () => any, timeout = 300) {
	let timer: number;
	return (...args: any[]) => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			// @ts-expect-error
			func.apply(this as unknown, args);
		}, timeout);
	};
}

// console.log(props.pages);

import Flipbook from '@nmathar/flipbook-vue3';
import { computed, onMounted, ref, watch, type ComputedRef } from 'vue';

const allPages = props.pages
	.map((page) => {
		return page[1];
	})
	.sort((a, b) => {
		if ((a.data.numL ?? a.data.numR ?? 0) < (b.data.numL ?? b.data.numR ?? 0)) {
			return -1;
		} else if ((a.data.numL ?? a.data.numR ?? 0) > (b.data.numL ?? b.data.numR ?? 0)) {
			return 1;
		}
		return 0;
	});

const allWorks = props.works.map((page) => {
	return page[1];
});

const spreadIds = allPages.flatMap((page) => {
	// console.log(page);
	return [page.data.imgL, page.data.imgR];
});

const hiResImages = spreadIds
	.map((img, index) => {
		if (index === 0 && !img) {
			return null;
		}
		if (!img) {
			// console.log('skipping hi-res null');
			return;
		}

		return `/imgs/2025/1.5x/${img}.png`;
	})
	.filter((a) => {
		if (a !== undefined) {
			return true;
		}
	});

const lowResImages = spreadIds.map((img, index) => {
	if (index === 0 && !img) {
		return null;
	}
	if (!img) {
		// console.log('skipping hi-res null');
		return;
	}
	return `/imgs/2025/0.75x/${img}.png`;
});

const currentPage = ref(props.currentPage);
const targetPage = ref(props.currentPage);

function getPageByNum(num: number) {
	console.time('getpagebynum');
	// console.log(`FlipNum: ${num}`);
	const page = allPages.find((page) => {
		// flip lib page numbers start at 1, litmag starts at 0.
		//

		return page.data.numL == num || page.data.numR == num;
	});
	console.timeEnd('getpagebynum');
	return page;
}

const numOfPagesBefore1 = allPages.flatMap((page) => {
	return [page.data.numL, page.data.numR].filter((num) => {
		if (num === undefined) {
			return false;
		} else if (num >= 1) {
			return false;
		} else return true;
	});
}).length;

// console.log(numOfPagesBefore1);

function flipNumToPageNum(num: number) {
	return num - numOfPagesBefore1;
}

function pageNumToFlipNum(num: number) {
	return num + numOfPagesBefore1;
}

function getSlug(num: number) {
	const data = getPageByNum(num);
	// console.info(
	// 	`FOUND SLUG: ${data?.id} for ${num} with numL ${data?.data.numL} and numR ${data?.data.numR}`
	// );
	// console.log(data);
	return data?.id;
}

function getPageBySlug(slug: string) {
	return allPages.find((page) => {
		return slug === page.id;
	});
}

const currentSlug = computed(() => {
	const slug = getSlug(currentPage.value);
	// console.info(`got slug ${slug} for ${currentPage.value}`);
});

const isDark = ref(true);

const themes = ref({} as Record<string, Theme>);

const currentPageData = computed(() => {
	return getPageByNum(currentPage.value);
});

async function getTheme(slug: string) {
	if (!themes.value[slug]) {
		const img = document.querySelector('.flipbook-container img.page.fixed')!;
		// alert(img.src)
		const theme = await themeFromImage(img as HTMLImageElement);
		let lsThemes = JSON.parse(window.localStorage.getItem('md-themes') ?? '{}');
		lsThemes[slug] = theme.source;

		window.localStorage.setItem('md-themes', JSON.stringify(lsThemes));
		themes.value[slug] = theme;
		return theme;
	} else {
		return themes.value[slug];
	}
}

onMounted(async () => {
	console.time('mount');
	addEventListener('popstate', (event) => {
		if (event.state.page) {
			currentPage.value = event.state.page;
		}
	});
	let lsThemeStrings = window.localStorage.getItem('md-themes');

	if (lsThemeStrings) {
		const lsThemes = JSON.parse(lsThemeStrings);
		applyTheme(themeFromSourceColor(lsThemes[getSlug(props.currentPage)!]), {
			dark: isDark.value
		});
	} else
		setTimeout(async () => {
			applyTheme((await getTheme(getSlug(props.currentPage)!)) as Theme, {
				dark: isDark.value
			});
		}, 300);
	artistDialog = document.getElementById('artistDialog') as MdDialog;
	searchDialog = document.getElementById('searchDialog') as MdDialog;
	searchField = document.getElementById('search') as any;
	searchResults = computedAsync(async () => {
		console.log('val', searchString.value);
		const results = (await Search(searchString.value)).map((res) => {
			console.log('result', res);
			return {
				res,
				just: getJustificationForSearchResult(res)
			};
		});
		console.log('results', results);
		return results;
	}) as any;
	console.timeEnd('mount');
});

async function pageTurnCallback(flipNum: number) {
	console.time('pageturn');

	const pageNum = flipNumToPageNum(flipNum);
	currentPage.value = pageNum;

	// console.info('PUSHED STATE');
	const slug = getSlug(pageNum);
	(async () => {
		applyTheme((await getTheme(slug!)) as Theme, {
			dark: isDark.value
		});
	})();

	window.history.pushState(
		{
			page: pageNum
		},
		'',
		`/2025/${slug}`
	);
	console.timeEnd('pageturn');
}

function getWorksForCurrentPage() {
	console.time('getworks');
	const works = currentPageData.value?.data.works;
	if (!works) return;
	const foundWorks = works.map((neededWork) => {
		const foundWork = allWorks.find((foundWork) => {
			return neededWork.id === foundWork.id;
		});
		if (foundWork) {
			console.timeEnd('getworks');
			return foundWork;
		}
	});
	if (
		foundWorks.every((workToBeTested) => {
			console.timeEnd('getworks');
			return !!workToBeTested;
		})
	) {
		console.timeEnd('getworks');
		return foundWorks;
	}
}

function getArtistsForWork() {
	console.time('getartists');
	const artists = currentPageData.value?.data.works;
	if (!artists) return;
	const foundArtists = artists.map((neededWork) => {
		const foundArtist = artists.find((foundWork) => {
			return neededWork.id === foundWork.id;
		});
		if (foundArtist) {
			console.timeEnd('getworks');
			return foundArtist;
		}
	});
	if (
		foundArtists.every((workToBeTested) => {
			console.timeEnd('getworks');
			return !!workToBeTested;
		})
	) {
		console.timeEnd('getartists');
		return foundArtists;
	}
}

let artistDialog: MdDialog;
let searchDialog: MdDialog;
const zoomLevel = ref(1);

function updateZoomLevel(lev: number) {
	zoomLevel.value = lev;
}

function showTableOfContents() {
	targetPage.value = 1;
	pageTurnCallback(2);
}

watch(currentPage, (newValue, oldValue) => {
	if ((oldValue === 0 || oldValue === 1) && newValue !== 0 && newValue !== 1) {
		// @ts-expect-error
		document.getElementById('findAPageSnackbar').show();
	} else {
		// console.info(`snackbar skipped, nv ${newValue} ov ${oldValue}`);
	}
});

const flipStartPage = pageNumToFlipNum(targetPage.value);

let searchField: HTMLElement;

function updateSearchString() {
	// @ts-expect-error
	searchString.value = searchField.value;
}

function filenameToSlug(fname: string) {
	return fname.split('.')[0];
}

const searchString = ref('');

export type Result = {
	res: CollectionSearchResult;
	just: ReturnType<typeof getJustificationForSearchResult>;
};
let searchResults: ComputedRef<Result[]>;

function getPageForSearchResult(res: CollectionSearchResult) {}
function getJustificationForSearchResult(res: CollectionSearchResult) {
	console.log('just4', res);
	const matchRzns = Object.values(res.match).flat();
	console.log('matchrzns', res.queryTerms, matchRzns);

	if (
		matchRzns.includes('numL') ||
		matchRzns.includes('numR') ||
		matchRzns.includes('name') ||
		matchRzns.includes('title')
	) {
		console.log('nojust');

		return;
	} else if (matchRzns.includes('body')) {
		console.log('body', res);

		// console.time('just');
		const just = {
			bold: Object.keys(res.match),
			text: getPageBySlug(filenameToSlug(res.filename))!.body!
		};
		// console.timeEnd('just');

		console.log('just', just);
		return just;
	} else {
		console.log('nojust', res);
		return;
	}
}
</script>

<template>
	<Flipbook
		class="flipbook font-sans flex flex-col-reverse pt-8 overflow-hidden"
		v-slot="flipbook"
		id="flipbook"
		@flip-left-end="pageTurnCallback"
		@flip-right-end="pageTurnCallback"
		@zoom-start="updateZoomLevel"
		:click-to-zoom="false"
		:drag-to-flip="true"
		:flip-duration="700"
		:start-page="flipStartPage"
		:pages="lowResImages as string[]"
		:pages-hi-res="hiResImages as string[]"
	>
		<nav class="p-2 flex flex-row gap-2 justify-between mt-4" id="nav">
			<div class="flex flex-row gap-4">
				<md-filled-tonal-button
					@click="flipbook.flipLeft"
					:disabled="!flipbook.canFlipLeft && flipbook.canFlipRight"
				>
					Previous Page
					<IconArrowBackRounded slot="icon" />
				</md-filled-tonal-button>
				<md-text-button @click="artistDialog.show()" class="transition-transform duration-200">
					View Artists
					<IconGroupRounded slot="icon" />
				</md-text-button>
			</div>

			<div class="flex flex-row gap-4 align-center transition-all duration-200 ease-in-out">
				<span
					class="my-auto text-3xl font-extrabold mx-4 transition-[width] duration-200 flex flex-row gap-2"
				>
					<IconBuildRounded v-if="props.dev" />

					{{ currentPageData?.data.title }}
				</span>

				<!-- ZOOM OUT BUTTON -->
				<div class="ml-4 flex flex-row gap-4">
					<md-filled-tonal-icon-button
						@click="flipbook.zoomOut()"
						class="transition-transform duration-200"
						:disabled="!flipbook.canZoomOut && flipbook.canZoomIn"
					>
						<IconRemoveRounded />
					</md-filled-tonal-icon-button>

					<!-- ZOOM LEVEL -->
					<span
						class="color-[var(--md-sys-color-on-surface-variant)] text-xl my-auto font-extrabold"
						>{{ zoomLevel * 100 + '%' }}</span
					>

					<!-- ZOOM IN BUTTON -->
					<md-filled-tonal-icon-button
						@click="flipbook.zoomIn()"
						class="transition-transform duration-200"
						:disabled="!flipbook.canZoomIn && flipbook.canZoomOut"
					>
						<IconAddRounded />
					</md-filled-tonal-icon-button>
				</div>
			</div>

			<!-- FIND PAGE BUTTON -->
			<div class="flex flex-row gap-4 relative">
				<md-outlined-button
					@click="
						searchDialog.show();
						searchField.focus();
					"
					id="findAPageBtn"
					class="transition-transform duration-200"
				>
					Search
					<IconSearchRounded slot="icon" />
				</md-outlined-button>
				<md-menu positioning="popover" id="findAPageMenu" anchor="findAPageBtn">
					<md-menu-item>
						<div slot="headline">Search...</div>
					</md-menu-item>
					<md-menu-item>
						<div slot="headline">Flip to Page...</div>
					</md-menu-item>
					<md-menu-item @click="showTableOfContents">
						<div slot="headline">Table of Contents</div>
					</md-menu-item>
				</md-menu>

				<!-- NEXT PAGE BUTTON -->
				<md-filled-button
					@click="flipbook.flipRight"
					class="text-sm"
					:disabled="flipbook.canFlipLeft && !flipbook.canFlipRight"
					trailing-icon
				>
					Next Page
					<IconArrowForwardRounded slot="icon" />
				</md-filled-button>
			</div>
		</nav>
		<md-dialog id="artistDialog">
			<div slot="headline">Artists & Writers</div>
		</md-dialog>
		<md-dialog id="searchDialog">
			<div slot="headline" class="">
				<h1 class="hidden">Search</h1>
				<md-outlined-text-field
					label="Search"
					type="search"
					id="search"
					autocomplete="off"
					@input.passive="
						updateSearchString();
						console.log(searchResults);
					"
				>
				</md-outlined-text-field>
			</div>
			<md-list slot="content">
				<md-list-item v-for="result in searchResults" type="link" class="rounded-lg">
					<div slot="headline">
						{{ result.res.frontmatter.name ?? result.res.frontmatter.title }}
					</div>
					<div slot="supporting-text">
						<Highlighter
							v-if="result.just"
							:text-to-highlight="result.just?.text"
							:search-words="result.just?.bold ?? []"
						/>
					</div>
				</md-list-item>
			</md-list>
			<!-- <span v-if="searchResults.length == 0" class="text-center">Type to start searching.</span> -->
		</md-dialog>
		<Transition> </Transition>
		<md-snackbar id="findAPageSnackbar" timeout="5000" class="absolute right-6 bottom-24 z-100">
			<span class="flex flex-row items-center gap-2">
				Click the
				<md-filled-tonal-button
					@click="searchDialog.show()"
					id="findAPageSnackbarBtn"
					class="transition-transform duration-200"
				>
					Search
					<IconSearchRounded slot="icon" />
				</md-filled-tonal-button>
				button below to navigate to a specific page.
			</span>
		</md-snackbar>
	</Flipbook>
</template>

<style>
.flipbook {
	height: 100% !important;
	width: 100% !important;
	.material-symbols-rounded {
		font-size: inherit !important;
		top: 0.115em !important;
	}
	.viewport img {
		pointer-events: none;
		width: 100%;
		height: 100%;
	}
	.viewport {
		border-radius: 8px;
		div:not(.click-to-flip):has(img:nth-of-type(2)) {
			img:nth-of-type(1) {
				mask-image: linear-gradient(
					90deg,
					rgba(255, 255, 255, 1) 96%,
					rgba(255, 255, 255, 0.78) 98%,
					rgba(255, 255, 255, 0.5) 100%
				);
			}
			img:nth-of-type(2) {
				mask-image: linear-gradient(
					270deg,
					rgba(255, 255, 255, 1) 96%,
					rgba(255, 255, 255, 0.78) 98%,
					rgba(255, 255, 255, 0.5) 100%
				);
			}
		}
	}
	/* .viewport.zoom img {
		pointer-events: all !important;
	} */

	color: var(--md-sys-color-on-surface);
	--md-dialog-container-color: var(--md-sys-color-surface);
	--md-sys-color-surface-container: var(--md-sys-color-surface);
	--md-outlined-text-field-container-color: var(--md-sys-color-surface);
	--md-outlined-text-field-container-shape: 20px;
}
</style>
