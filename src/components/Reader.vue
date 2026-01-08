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
	IconInfoRounded,
	IconHomeRounded,
	IconBookRounded
	// @ts-expect-error
} from '@iconify-prerendered/vue-material-symbols';
import { MdDialog } from '@material/web/dialog/dialog.js';
import 'v-onboarding/dist/style.css';
// import '@material/web/all.js';
import '@material/web/common.js';
import '@material/web/button/filled-button.js';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/button/text-button.js';
import '@material/web/button/outlined-button.js';
// import '@material/web/field/outlined-field.js';
import '@material/web/iconbutton/icon-button.js';
import '@material/web/iconbutton/filled-icon-button.js';
import '@material/web/iconbutton/filled-tonal-icon-button.js';
import '@material/web/iconbutton/outlined-icon-button.js';
import '@material/web/list/list.js';
import '@material/web/list/list-item.js';
import '@material/web/textfield/outlined-text-field.js';

// import '@maicol07/material-web-additions/snackbar/snackbar.js';

// import { Search, type CollectionSearchResult } from 'astro-collection-search/self';

// import Highlighter from 'vue-highlight-words';

// import MagSettings from '../../content/settings2025.yaml';

// import { computedAsync } from '@vueuse/core';

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
	websiteDialog = document.getElementById('websiteDialog') as MdDialog;
	searchDialog = document.getElementById('searchDialog') as MdDialog;
	searchField = document.getElementById('goto') as any;
	searchFieldSm = document.getElementById('goto-sm') as any;

	// searchButton = document.getElementById('gotobtn') as any;
	// searchResults = computedAsync(async () => {
	// 	console.log('val', searchString.value);
	// 	const results = (await Search(searchString.value)).map((res) => {
	// 		console.log('result', res);
	// 		return {
	// 			res,
	// 			just: getJustificationForSearchResult(res)
	// 		};
	// 	});
	// 	console.log('results', results);
	// 	return results;
	// }) as any;
	// Make sure this code gets executed after the DOM is loaded.
	document.getElementById('goto')!.addEventListener('keyup', (event) => {
		if (event.key !== 'Enter') return; // Use `.key` instead.
		goToSearchedPage();
		event.preventDefault(); // No need to `return false;`.
	});
	document.getElementById('goto-sm')!.addEventListener('keyup', (event) => {
		if (event.key !== 'Enter') return; // Use `.key` instead.
		goToSearchedPageSm();
		event.preventDefault(); // No need to `return false;`.
	});
	worksForCurrentPage.value = getWorksForCurrentPage()!;
	console.timeEnd('mount');
});

async function pageTurnCallback(flipNum: number) {
	console.time('pageturn');

	const pageNum = flipNumToPageNum(flipNum);
	console.log(flipNum, pageNum);
	currentPage.value = pageNum;

	// console.info('PUSHED STATE');
	const slug = getSlug(pageNum);
	(async () => {
		applyTheme((await getTheme(slug!)) as Theme, {
			dark: isDark.value
		});
	})();
	worksForCurrentPage.value = getWorksForCurrentPage()!;

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
	if (!works) {
		console.info('no works found');
		return;
	}
	const foundWorks = works.map((neededWork) => {
		const foundWork = allWorks.find((foundWork) => {
			return neededWork.id === foundWork.id;
		});
		if (foundWork) {
			console.timeEnd('getworks');
			foundWork.data.authors = getArtistsForWork(foundWork);
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
		console.info(foundWorks);
		return foundWorks;
	}
}

function getArtistsForWork(work: (typeof props.works)[0][1]) {
	console.time('getartists');
	const artists = work.data.authors;
	if (!artists) return [];
	const foundArtists = artists
		.map((neededArtist) => {
			return (
				props.authors.find((foundArtist) => {
					return neededArtist.id === foundArtist[1].id;
				})![1] || undefined
			);
		})
		.filter((artist) => !!artist);
	console.timeEnd('getartists');
	return foundArtists;
}

let artistDialog: MdDialog;
let searchDialog: MdDialog;
let websiteDialog: MdDialog;
const zoomLevel = ref(1);

function updateZoomLevel(lev: number) {
	zoomLevel.value = lev;
}

function showTableOfContents() {
	targetPage.value = 1;
	pageTurnCallback(2);
}

// watch(currentPage, (newValue, oldValue) => {
// 	if ((oldValue === 0 || oldValue === 1) && newValue !== 0 && newValue !== 1) {
// 		// @ts-expect-error
// 		// document.getElementById('findAPageSnackbar').show();
// 	} else {
// 		// console.info(`snackbar skipped, nv ${newValue} ov ${oldValue}`);
// 	}
// });

const flipStartPage = computed(() => pageNumToFlipNum(targetPage.value));

let searchField: HTMLInputElement;
let searchFieldSm: HTMLInputElement;

// // let searchButton: HTMLElement;

// function updateSearchString() {
// 	searchString.value = searchField.value;
// }

// function filenameToSlug(fname: string) {
// 	return fname.split('.')[0];
// }

const worksForCurrentPage = ref([] as (typeof props.works)[0][1][]);

// const searchString = ref('');

// export type Result = {
// 	res: CollectionSearchResult;
// 	just: ReturnType<typeof getJustificationForSearchResult>;
// };
// let searchResults: ComputedRef<Result[]>;

// function getPageForSearchResult(res: CollectionSearchResult) {}
// function getJustificationForSearchResult(res: CollectionSearchResult) {
// 	console.log('just4', res);
// 	const matchRzns = Object.values(res.match).flat();
// 	console.log('matchrzns', res.queryTerms, matchRzns);

// 	if (
// 		matchRzns.includes('numL') ||
// 		matchRzns.includes('numR') ||
// 		matchRzns.includes('name') ||
// 		matchRzns.includes('title')
// 	) {
// 		console.log('nojust');

// 		return;
// 	} else if (matchRzns.includes('body')) {
// 		console.log('body', res);

// 		// console.time('just');
// 		const just = {
// 			bold: Object.keys(res.match),
// 			text: getPageBySlug(filenameToSlug(res.filename))!.body!
// 		};
// 		// console.timeEnd('just');

// 		console.log('just', just);
// 		return just;
// 	} else {
// 		console.log('nojust', res);
// 		return;
// 	}
// }

// console.log(lowResImages);

function goToSearchedPage() {
	currentPage.value = parseInt(searchField.value);
	targetPage.value = parseInt(searchField.value);
}
function goToSearchedPageSm() {
	currentPage.value = parseInt(searchFieldSm.value);
	targetPage.value = parseInt(searchFieldSm.value);
}

function makeString(arr: string[]) {
	if (arr.length === 1) return arr[0];
	const firsts = arr.slice(0, arr.length - 1);
	const last = arr[arr.length - 1];
	return firsts.join(', ') + ' and ' + last;
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
		<nav class="p-2 flex flex-col xl:flex-row gap-6 xl:gap-2 justify-between mt-4" id="nav">
			<div class="flex-row gap-4 items-center hidden xl:flex">
				<md-filled-tonal-button
					@click="flipbook.flipLeft"
					:disabled="!flipbook.canFlipLeft && flipbook.canFlipRight"
					class="text-sm"
				>
					Previous Page
					<IconArrowBackRounded slot="icon" />
				</md-filled-tonal-button>

				<md-text-button @click="artistDialog.show()" class="transition-transform duration-200">
					Artists and Info
					<IconGroupRounded slot="icon" />
				</md-text-button>
				<md-icon-button href="/" class="transition-transform duration-200">
					<IconHomeRounded />
				</md-icon-button>
			</div>

			<!-- Small displays -->
			<div class="flex flex-row xl:hidden w-full">
				<md-icon-button class="transition-transform duration-200" href="/">
					<IconHomeRounded />
				</md-icon-button>
				<span
					class="my-auto text-3xl font-extrabold transition-[width] duration-200 flex flex-row gap-2 xl:hidden mx-auto"
				>
					<IconBuildRounded v-if="props.dev" />

					{{ currentPageData?.data.title }}
				</span>
				<md-outlined-icon-button
					@click="artistDialog.show()"
					class="transition-transform duration-200"
				>
					<IconInfoRounded />
				</md-outlined-icon-button>
			</div>
			<div class="flex-row gap-4 items-center flex xl:hidden w-full justify-between">
				<md-filled-tonal-icon-button
					class="flex xl:hidden"
					@click="flipbook.flipLeft"
					:disabled="!flipbook.canFlipLeft && flipbook.canFlipRight"
				>
					<IconArrowBackRounded />
				</md-filled-tonal-icon-button>
				<md-outlined-text-field
					placeholder="Go to..."
					type="number"
					min="0"
					max="33"
					class="w-36"
					id="goto-sm"
					no-spinner
					@submit="goToSearchedPageSm()"
					><md-filled-icon-button
						slot="trailing-icon"
						class="mr-2 absolute"
						id="gotobtn-sm"
						@click="goToSearchedPageSm()"
					>
						<IconSearchRounded /> </md-filled-icon-button
				></md-outlined-text-field>
				<md-filled-icon-button
					class="flex xl:hidden"
					@click="flipbook.flipRight"
					:disabled="flipbook.canFlipLeft && !flipbook.canFlipRight"
				>
					<IconArrowForwardRounded />
				</md-filled-icon-button>
			</div>

			<div
				class="flex-row gap-4 align-center transition-all duration-200 ease-in-out hidden xl:flex"
			>
				<span
					class="my-auto text-3xl font-extrabold mx-4 transition-[width] duration-200 flex flex-row gap-2"
				>
					<IconBuildRounded v-if="props.dev" />

					{{ currentPageData?.data.title }}
				</span>

				<!-- ZOOM OUT BUTTON -->
				<div class="ml-4 flex-row gap-4 items-center flex">
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
			<div class="flex-row gap-4 relative items-center hidden xl:flex">
				<!-- <md-outlined-button
					@click="
						searchDialog.show();
						searchField.focus();
					"
					id="findAPageBtn"
					class="transition-transform duration-200"
				>
					Go to Page
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
				</md-menu> -->
				<md-outlined-text-field
					placeholder="Go to page..."
					type="number"
					min="0"
					max="33"
					class="w-46"
					id="goto"
					no-spinner
					@submit="goToSearchedPage()"
					><md-filled-icon-button
						slot="trailing-icon"
						class="mr-2 absolute"
						id="gotobtn"
						@click="goToSearchedPage()"
					>
						<IconSearchRounded /> </md-filled-icon-button
				></md-outlined-text-field>
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
			<div slot="content">
				<md-list>
					<md-list-item v-for="work in worksForCurrentPage">
						<h1 slot="headline">
							{{ work.data.title }}
							<div v-if="work.data.authors!.length !== 0" class="opacity-60">
								by {{ makeString(work.data.authors!.map((author) => author.data.name)) }}
							</div>
						</h1>

						<p slot="supporting-text" v-if="work.body">{{ work.body }}</p>
					</md-list-item>
					<md-list-item type="link">
						<div
							slot="headline"
							class="opacity-60"
							@click="
								artistDialog.close();
								websiteDialog.show();
							"
						>
							Website credits
						</div>
						<IconInfoRounded slot="end" />
					</md-list-item>
				</md-list>
			</div>
		</md-dialog>
		<md-dialog id="websiteDialog" class="max-w-50">
			<div slot="headline">About this website</div>
			<div slot="content">
				<p>This website was made using <b>*MagDrop</b>, a blue linden product.</p>
				<p>
					Design and code for the 2025 Literary Magazine were created using absolutely no generative
					AI.
				</p>
				<p>
					The entirety of the code written for this website is open source on Github at
					<a href="https://github.com/bluelinden/new-litmag-website" class="underline"
						>bluelinden/new-litmag-website</a
					>. The magazine itself and all of its assets are owned entirely by the Justice Lit Mag and
					all rights are reserved.
				</p>
				<p>Special thanks to <a href="https://github.com/nmathar/flipbook-vue3" class="underline">NMathar on GitHub</a> for the page-flipping effect that this entire website is built around.</p>
				<img src="/imgs/2025/magdrop-exp.svg" />
			</div>
		</md-dialog>
		<!-- <md-dialog id="searchDialog">
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
			<!-- <span v-if="searchResults.length == 0" class="text-center">Type to start searching.</span>
		</md-dialog> -->
		<!-- <Transition> </Transition> -->
		<!-- <md-snackbar id="findAPageSnackbar" timeout="5000" class="absolute right-6 bottom-24 z-100">
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
		</md-snackbar> -->
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

	ul {
		list-style-type: none; /* Remove bullets */
		padding: 0; /* Remove padding */
		margin: 0; /* Remove margins */
	}
	/* .viewport.zoom img {
		pointer-events: all !important;
	} */

	color: var(--md-sys-color-on-surface);
	--md-dialog-container-color: var(--md-sys-color-surface);
	--md-sys-color-surface-container: var(--md-sys-color-surface);
	--md-outlined-text-field-container-color: var(--md-sys-color-surface);
	--md-icon-button-icon-color: var(--md-sys-color-primary);

	--md-outlined-text-field-container-shape: 20px;
}
</style>
