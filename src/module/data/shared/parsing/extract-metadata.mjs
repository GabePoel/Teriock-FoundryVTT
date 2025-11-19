//noinspection JSUnusedGlobalSymbols

/**
 * Extract all the impact metadata from an HTML string.
 * @param {string} html
 * @returns {Record<string, DOMStringMap[]>}
 */
export function extractMetadataFromHTML(html) {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  return extractMetadataFromElement(tempDiv);
}

/**
 * Extract all the impact metadata from an HTML element.
 * @param {HTMLElement} element
 * @returns {Record<string, DOMStringMap[]>}
 */
export function extractMetadataFromElement(element) {
  const metadata = {};
  element.querySelectorAll("span.metadata").forEach(
    /** @param {HTMLSpanElement} el */ (el) => {
      const type = el.dataset.type;
      if (!metadata[type]) {
        metadata[type] = [];
      }
      metadata[type].push(Object(el.dataset));
    },
  );
  return metadata;
}
