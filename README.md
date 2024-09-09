# The Justice Lit Mag's website
The Justice Lit Mag is an organization dedicated to publishing artwork made by Justice students.

## Structure
Various nested page layouts are contained in the `src/` folder. The standard page layout with navigation and a large image view can be imported from `src/layouts/ToolBarContained.astro`. Various parameters are passed to this layout from routes to render both the navigation and the page.

Routes are contained in `src/pages`, and the routes for the 2024 Lit Mag are in `src/pages/2024`. `[...slug].astro` is the catch-all page that renders a content page for any given page slug.

The pages themselves are in `src/content/pages2024`. Authors are in `src/content/authors2024`. If a page lists authors, all references must be valid, and vice versa.

The schemas for each are in `src/content/config.ts`.

# Building

Install bun from [bun.sh](https://bun.sh). Run `bun install` to download all of the dependencies for this project. 

Run `bun run dev` to spin up a local live site for development.

Run `bun run build` to build the site for production.

Run `bun run deploy` to upload the built site to Cloudflare.