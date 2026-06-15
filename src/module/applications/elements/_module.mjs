import HTMLIdentifierInputElement from "./identifier-input.mjs";
import HTMLIdentifierTagsElement from "./identifier-tags.mjs";
import HTMLTernaryElement from "./ternary-input.mjs";
import HTMLToggleButtonElement from "./toggle-button.mjs";

export { default as HTMLIdentifierInputElement } from "./identifier-input.mjs";
export { default as HTMLIdentifierTagsElement } from "./identifier-tags.mjs";
export { default as HTMLTernaryElement } from "./ternary-input.mjs";
export { default as HTMLToggleButtonElement } from "./toggle-button.mjs";

window.customElements.define(HTMLIdentifierInputElement.tagName, HTMLIdentifierInputElement);
window.customElements.define(HTMLIdentifierTagsElement.tagName, HTMLIdentifierTagsElement);
window.customElements.define(HTMLTernaryElement.tagName, HTMLTernaryElement);
window.customElements.define(HTMLToggleButtonElement.tagName, HTMLToggleButtonElement);
