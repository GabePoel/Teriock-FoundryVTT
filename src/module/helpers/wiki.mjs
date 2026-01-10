export function openWikiPage(title) {
  const baseWikiUrl = "https://wiki.teriock.com";
  const pageUrl = `${baseWikiUrl}/index.php/${encodeURIComponent(title)}`;
  window.open(pageUrl, "_blank");
}
