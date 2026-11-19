import HTMLElderSorceryWordsElement from "./elder-sorcery-words-element.mjs";
import HTMLIdentifierTagsElement from "./identifier-tags-element.mjs";
import HTMLLocalDocumentElement from "./local-document-element.mjs";
import HTMLSlugInputElement from "./slug-input-element.mjs";
import HTMLSlugTagsElement from "./slug-tags-element.mjs";
import HTMLTernaryButtonElement from "./ternary-button-element.mjs";
import HTMLToggleButtonElement from "./toggle-button-element.mjs";
import HTMLUnitInputElement from "./unit-input-element.mjs";

export * from "./abstract/_module.mjs";
export { default as HTMLElderSorceryWordsElement } from "./elder-sorcery-words-element.mjs";
export { default as HTMLIdentifierTagsElement } from "./identifier-tags-element.mjs";
export { default as HTMLLocalDocumentElement } from "./local-document-element.mjs";
export { default as HTMLSlugInputElement } from "./slug-input-element.mjs";
export { default as HTMLSlugTagsElement } from "./slug-tags-element.mjs";
export { default as HTMLTernaryButtonElement } from "./ternary-button-element.mjs";
export { default as HTMLToggleButtonElement } from "./toggle-button-element.mjs";
export { default as HTMLUnitInputElement } from "./unit-input-element.mjs";

window.customElements.define(HTMLElderSorceryWordsElement.tagName, HTMLElderSorceryWordsElement);
window.customElements.define(HTMLIdentifierTagsElement.tagName, HTMLIdentifierTagsElement);
window.customElements.define(HTMLLocalDocumentElement.tagName, HTMLLocalDocumentElement);
window.customElements.define(HTMLSlugInputElement.tagName, HTMLSlugInputElement);
window.customElements.define(HTMLSlugTagsElement.tagName, HTMLSlugTagsElement);
window.customElements.define(HTMLTernaryButtonElement.tagName, HTMLTernaryButtonElement);
window.customElements.define(HTMLToggleButtonElement.tagName, HTMLToggleButtonElement);
window.customElements.define(HTMLUnitInputElement.tagName, HTMLUnitInputElement);
