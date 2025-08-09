import fetchCategoryMembers from "./fetch-category-members.mjs";

/**
 * Fetches all ability names within a wiki category via the MediaWiki API.
 *
 * @param {string} category - The name (without namespace) of the category to fetch from.
 * @returns {Promise<string[]>} An array of names of member pages.
 */
export default async function fetchCategoryAbilities(category) {
  let pages = await fetchCategoryMembers(category);
  pages = pages.filter((page) => page.title.includes("Ability:"));
  return pages.map((page) => page.title.split("Ability:")[1]);
}
