/**
 * Fetches all pages in a given namespace via the MediaWiki API.
 * @param {string} namespace - The namespace name to fetch pages from (e.g., "Main", "Talk", "User", "Template",
 *   "Category", etc.).
 * @returns {Promise<Array>} An array of page objects, or an empty array if the request fails.
 */
export default async function fetchNamespacePages(namespace) {
  const endpoint = "https://wiki.teriock.com/api.php";
  const LIMIT = 500;
  let pages = [];
  let apcontinue = null;

  try {
    do {
      const params = new URLSearchParams({
        action: "query",
        list: "allpages",
        apnamespace: namespace,
        aplimit: LIMIT,
        format: "json",
        origin: "*",
      });

      if (apcontinue) {
        params.append("apcontinue", apcontinue);
      }

      const url = `${endpoint}?${params.toString()}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.query?.allpages) {
        pages.push(...data.query.allpages);
      }

      apcontinue = data.continue?.apcontinue;
    } while (apcontinue);

    return pages;
  } catch (error) {
    console.error("Error fetching namespace pages:", namespace, error);
    return [];
  }
}