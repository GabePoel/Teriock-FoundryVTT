/**
 * Builds a tag tree from tag containers in the document.
 * Extracts and organizes tags from CSS classes for processing.
 * @param {HTMLElement} htmlElement - The parsed HTML document.
 * @returns {object} Object containing organized tags by type.
 */
export function buildTagTree(htmlElement) {
  const tagTree = {};
  htmlElement.querySelectorAll(".tag-container").forEach((el) => {
    const tags = Array.from(el.classList)
      .filter((cls) => cls.endsWith("-tagged"))
      .map((cls) => cls.replace("-tagged", ""));
    if (tags.length) {
      if (tags.length === 1) {
        tagTree[tags[0]] = true;
      } else {
        tagTree[tags[0]] = tagTree[tags[0]] || [];
        tagTree[tags[0]].push(...tags.slice(1));
      }
    }
  });
  return tagTree;
}
