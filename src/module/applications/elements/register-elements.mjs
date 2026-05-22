import HTMLIdentifierInputElement from "./identifier-input.mjs";
import HTMLIdentifierTagsElement from "./identifier-tags.mjs";

/**
 * Register custom elements.
 */
export default function registerElements() {
  if (!window.customElements.get(HTMLIdentifierInputElement.tagName))
    window.customElements.define(HTMLIdentifierInputElement.tagName, HTMLIdentifierInputElement);
  if (!window.customElements.get(HTMLIdentifierTagsElement.tagName))
    window.customElements.define(HTMLIdentifierTagsElement.tagName, HTMLIdentifierTagsElement);
}
