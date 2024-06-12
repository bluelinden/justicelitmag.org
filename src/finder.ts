import { getEntries, getEntry } from 'astro:content';

export default async function getAuthorsForPage(searchString: string) {
	const pageData = await getEntry('pages2024', searchString);
	return pageData?.data.authors ? getEntries(pageData?.data.authors) : undefined;
}