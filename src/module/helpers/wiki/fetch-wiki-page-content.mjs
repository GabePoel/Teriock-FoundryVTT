/**
 * Fetches the raw content of a wiki page via the MediaWiki API.
 * @param {string} title - The title of the wiki page to fetch.
 * @returns {Promise<string|null>} The raw wiki content as a string, or null if the request fails.
 */
export default async function fetchWikiPageContent(title) {
  const endpoint = "https://wiki.teriock.com/api.php";

  const params = new URLSearchParams({
    action: "query",
    prop: "revisions",
    rvprop: "content",
    format: "json",
    origin: "*",
    titles: title,
  });

  const url = `${endpoint}?${params.toString()}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const pages = data.query.pages;
    const page = Object.values(pages)[0];

    return page.revisions?.[0]?.slots?.main["*"] || page.revisions?.[0]["*"];
  } catch (error) {
    console.error("Error fetching page:", title, error);
  }
}
