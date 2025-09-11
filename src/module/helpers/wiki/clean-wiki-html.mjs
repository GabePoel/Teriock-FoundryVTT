/**
 * Cleans and processes HTML content from the wiki by removing comments and extracting the main content.
 * @param {string} html - The raw HTML content to clean.
 * @param {object} [options]
 * @param {boolean} [options.noSubs]
 * @returns {Promise<string>} The cleaned HTML content.
 */
export default async function cleanWikiHTML(html, options = {}) {
  const { noSubs = false } = options;
  let doc;

  if (typeof window === "undefined") {
    // Node.js
    const { JSDOM } = await import("jsdom");
    doc = new JSDOM(html).window.document;
  } else {
    // Browser
    doc = new DOMParser().parseFromString(html, "text/html");
  }

  const container = doc.querySelector(".mw-parser-output");
  if (!container) {
    return "";
  }

  const toRemove = [
    "img",
    "figcaption",
    "figure",
  ];
  if (noSubs) {
    toRemove.push(...[
      ".expandable-container",
      ".ability-sub-container",
      ".metadata",
    ]);
  }
  for (const el of toRemove) {
    doc.querySelectorAll(el).forEach((el) => el.remove());
  }

  const removeComments = (node) => {
    for (let child of Array.from(node.childNodes)) {
      if (child.nodeType === 8) {
        node.removeChild(child);
      } else if (child.nodeType === 1) {
        removeComments(child);
      }
    }
  };

  removeComments(container);
  return container.innerHTML.trim();
}
