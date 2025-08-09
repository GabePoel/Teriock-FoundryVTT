/**
 * Fetches all members of a wiki category via the MediaWiki API.
 * @param {string} category - The name (without namespace) of the category to fetch members from.
 * @returns {Promise<Array>} An array of category member objects, or an empty array if the request fails.
 */
export default async function fetchCategoryMembers(category) {
  const endpoint = "https://wiki.teriock.com/api.php";
  const LIMIT = 500;
  let members = [];
  let cmcontinue = null;

  try {
    do {
      const params = new URLSearchParams({
        action: "query",
        list: "categorymembers",
        cmtitle: `Category:${category}`,
        cmlimit: LIMIT,
        format: "json",
        origin: "*",
      });

      if (cmcontinue) {
        params.append("cmcontinue", cmcontinue);
      }

      const url = `${endpoint}?${params.toString()}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.query?.categorymembers) {
        members.push(...data.query.categorymembers);
      }

      cmcontinue = data.continue?.cmcontinue;
    } while (cmcontinue);

    return members;
  } catch (error) {
    console.error("Error fetching category members:", category, error);
    return [];
  }
}
