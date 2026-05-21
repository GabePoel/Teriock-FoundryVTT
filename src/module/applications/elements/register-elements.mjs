import HTMLIdentifierTagsElement from "./identifier-tags.mjs";

/**
 * Register custom elements.
 */
export default function registerElements() {
  if (!window.customElements.get(HTMLIdentifierTagsElement.tagName)) {
    window.customElements.define(HTMLIdentifierTagsElement.tagName, HTMLIdentifierTagsElement);
  }
}
