import HTMLIdentifierInputElement from "./identifier-input.mjs";
import HTMLIdentifierTagsElement from "./identifier-tags.mjs";
import HTMLTernaryElement from "./ternary-input.mjs";

/**
 * Register custom elements.
 */
export default function registerElements() {
  for (const el of [HTMLIdentifierInputElement, HTMLIdentifierTagsElement, HTMLTernaryElement]) {
    if (!window.customElements.get(el.tagName)) { window.customElements.define(el.tagName, el); }
  }
}
