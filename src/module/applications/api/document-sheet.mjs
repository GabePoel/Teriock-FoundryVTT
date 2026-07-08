import BaseDocumentSheetMixin from "./mixins/base-document-sheet-mixin.mjs";

const { DocumentSheetV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * @extends {DocumentSheetV2}
 * @mixes HandlebarsApplication
 * @property {TeriockDocument} document
 */
export default class TeriockDocumentSheet extends BaseDocumentSheetMixin(HandlebarsApplicationMixin(DocumentSheetV2)) {}
