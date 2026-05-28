/**
 * Open a page on the [Teriock wiki](https://wiki.teriock.com).
 * @param title
 */
export function openWikiPage(title) {
  const pageUrl = `${TERIOCK.config.wiki.address}/${encodeURIComponent(title)}`;
  window.open(pageUrl, "_blank");
}
