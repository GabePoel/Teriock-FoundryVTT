/**
 * Opens a wiki page in a new browser tab.
 * @param {string} title - The title of the wiki page to open.
 */
export default function openWikiPage(title) {
  const baseWikiUrl = "https://wiki.teriock.com";
  const pageUrl = `${baseWikiUrl}/index.php/${encodeURIComponent(title)}`;
  window.open(pageUrl, "_blank");
}