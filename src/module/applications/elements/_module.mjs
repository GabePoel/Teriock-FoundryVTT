import HTMLIdentifierTagsElement from "./identifier-tags.mjs";
import HTMLLocalDocumentElement from "./local-document.mjs";
import HTMLSlugInputElement from "./slug-input.mjs";
import HTMLSlugTagsElement from "./slug-tags.mjs";
import HTMLTernaryButtonElement from "./ternary-button.mjs";
import HTMLToggleButtonElement from "./toggle-button.mjs";
import HTMLUnitInputElement from "./unit-input.mjs";

export * from "./abstract/_module.mjs";
export { default as HTMLIdentifierTagsElement } from "./identifier-tags.mjs";
export { default as HTMLLocalDocumentElement } from "./local-document.mjs";
export { default as HTMLSlugInputElement } from "./slug-input.mjs";
export { default as HTMLSlugTagsElement } from "./slug-tags.mjs";
export { default as HTMLTernaryButtonElement } from "./ternary-button.mjs";
export { default as HTMLToggleButtonElement } from "./toggle-button.mjs";
export { default as HTMLUnitInputElement } from "./unit-input.mjs";

window.customElements.define(HTMLIdentifierTagsElement.tagName, HTMLIdentifierTagsElement);
window.customElements.define(HTMLLocalDocumentElement.tagName, HTMLLocalDocumentElement);
window.customElements.define(HTMLSlugInputElement.tagName, HTMLSlugInputElement);
window.customElements.define(HTMLSlugTagsElement.tagName, HTMLSlugTagsElement);
window.customElements.define(HTMLTernaryButtonElement.tagName, HTMLTernaryButtonElement);
window.customElements.define(HTMLToggleButtonElement.tagName, HTMLToggleButtonElement);
window.customElements.define(HTMLUnitInputElement.tagName, HTMLUnitInputElement);
