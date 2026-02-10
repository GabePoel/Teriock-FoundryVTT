/**
 * Open a page on the [Teriock wiki](https://wiki.teriock.com).
 * @param title
 */
export function openWikiPage(title) {
  const baseWikiUrl = "https://wiki.teriock.com";
  const pageUrl = `${baseWikiUrl}/index.php/${encodeURIComponent(title)}`;
  window.open(pageUrl, "_blank");
}
