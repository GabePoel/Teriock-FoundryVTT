/**
 * Fetches all categories that a wiki page belongs to via the MediaWiki API.
 * @param {string} title - The page title (without namespace prefix unless needed), e.g. "Apple".
 * @param {object} [options]
 * @param {boolean} [options.includeHidden=false] - Include hidden categories as well.
 * @returns {Promise<Array<{ ns: number, title: string, hidden?: string }>>}
 */
export default async function fetchPageCategories(
  title,
  { includeHidden = false } = {},
) {
  const endpoint = "https://wiki.teriock.com/api.php";
  const LIMIT = 500;
  let categories = [];
  let clcontinue = null;

  try {
    do {
      const params = new URLSearchParams({
        action: "query",
        prop: "categories",
        titles: title,
        format: "json",
        origin: "*",
        cllimit: LIMIT.toString(), // Return 'hidden' flag in each item if present (the API includes a key 'hidden': ''
        // when hidden)
        clprop: "hidden",
        redirects: "1", // follow redirects to the target page
      });

      // Exclude hidden categories unless explicitly requested
      if (!includeHidden) {
        params.set("clshow", "!hidden");
      }

      if (clcontinue) {
        params.set("clcontinue", clcontinue);
      }

      const url = `${endpoint}?${params.toString()}`;
      const res = await fetch(url);
      const data = await res.json();

      const pages = data?.query?.pages || {};
      const firstPage = Object.values(pages)[0];

      if (firstPage?.categories?.length) {
        categories.push(...firstPage.categories);
      }

      clcontinue = data?.continue?.clcontinue || null;
    } while (clcontinue);

    return categories;
  } catch (error) {
    console.error("Error fetching page categories:", title, error);
    return [];
  }
}
