/**
 * Simplify a tag.
 * @param {Teriock.Display.DisplayTag} tag
 * @returns {string}
 * @deprecated
 */
export function simplifyTag(tag) {
  if (typeof tag === "string") { return _loc(tag); }
  if (typeof tag.label === "string") { return _loc(tag.label); }
  return "";
}

/**
 * Simplify multiple tags.
 * @param {Teriock.Display.DisplayTag[]} tags
 * @returns {string[]}
 * @deprecated
 */
export function simplifyTags(tags) {
  return tags.map(t => simplifyTag(t));
}
