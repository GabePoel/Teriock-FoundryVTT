import HTMLIdentifierInputElement from "./identifier-input.mjs";
import HTMLIdentifierTagsElement from "./identifier-tags.mjs";
import HTMLTernaryButtonElement from "./ternary-button.mjs";
import HTMLToggleButtonElement from "./toggle-button.mjs";

export * from "./abstract/_module.mjs";
export { default as HTMLIdentifierInputElement } from "./identifier-input.mjs";
export { default as HTMLIdentifierTagsElement } from "./identifier-tags.mjs";
export { default as HTMLTernaryButtonElement } from "./ternary-button.mjs";
export { default as HTMLToggleButtonElement } from "./toggle-button.mjs";

window.customElements.define(HTMLIdentifierInputElement.tagName, HTMLIdentifierInputElement);
window.customElements.define(HTMLIdentifierTagsElement.tagName, HTMLIdentifierTagsElement);
window.customElements.define(HTMLTernaryButtonElement.tagName, HTMLTernaryButtonElement);
window.customElements.define(HTMLToggleButtonElement.tagName, HTMLToggleButtonElement);
