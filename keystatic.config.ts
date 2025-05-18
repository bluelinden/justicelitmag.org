// keystatic.config.ts
import { collection, config, fields, singleton } from '@keystatic/core';

export default config({
	storage: {
		kind: 'local'
	},
	ui: {
		brand: {
			name: 'The Justice Lit Mag'
		}
	},
	singletons: {
		magSettings: singleton({
			label: 'Magazine Settings',
			path: 'content/settings2025',
			schema: {
				tableOfContents: fields.integer({
					label: 'Table of Contents Page Number',
					description: 'Page number containing the Table of Contents'
				})
			}
		})
	},
	collections: {
		spreads2025: collection({
			label: 'Spreads (2025)',
			slugField: 'title',
			path: 'content/spreads2025/*',
			columns: ['title', "numL", "numR"],
			format: { contentField: 'content' },
			schema: {
				title: fields.slug({ name: { label: 'Title' } }),
				works: fields.multiRelationship({
					collection: 'works2025',
					label: 'Pieces',
					description: 'List of all pieces present on the page.'
				}),

				// numbers: fields.object({
				numL: fields.number({
					label: 'Page Number (left)',
					description: 'Page number for the left page. Should match the one on the page itself.'
				}),
				numR: fields.number({
					label: 'Page Number (right)',
					description: 'Page number for the right page. Should match the one on the page itself.'
				}),
				// }),
				// images: fields.object({
				imgL: fields.text({
					label: 'Image ID (left)',
					description: 'Image ID for the left page of this spread.'
				}),
				imgR: fields.text({
					label: 'Image ID (right)',
					description: 'Image ID for the right side of the field.'
				}),
				// }),

				content: fields.markdoc({ label: 'Content' }),
				display: fields.multiselect({
					label: 'DisplayOptions',
					options: [
						{
							label: 'Show Web Credits',
							value: 'webCredits'
						},
						{
							label: 'Show Page Jump Button',
							value: 'pageJump'
						}
					]
				})
			}
		}),
		works2025: collection({
			label: 'Pieces (2025)',
			slugField: 'title',
			path: 'content/works2025/*',
			format: { contentField: 'content' },
			schema: {
				title: fields.slug({ name: { label: 'Title' } }),
				content: fields.markdoc({
					label: 'Content',
					description:
						"Either the text content of the piece if it's a written piece, or the artist's statement."
				}),
				authors: fields.multiRelationship({
					collection: 'authors2025',
					label: 'Authors',
					description: 'List of authors who created this piece.'
				})
			}
		}),
		authors2025: collection({
			label: 'Creators (2025)',
			slugField: 'name',
			columns: ['name', 'position'],
			format: {
				contentField: 'bio'
			},
			path: 'content/authors2025/*',
			schema: {
				name: fields.slug({
					name: {
						label: 'Name'
					}
				}),
				position: fields.text({
					label: 'Editorial Position',
					description: 'The position this person held, if applicable.'
				}),
				bio: fields.markdoc({
					label: 'Bio',
					description: 'An autobiographical description of this person.'
				})
			}
		})
	},
	locale: 'en-US'
});
