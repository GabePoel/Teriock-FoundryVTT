import BaseSheetMixin from "../mixins/base-sheet-mixin.mjs";

const { DocumentSheetV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * @extends {DocumentSheetV2}
 * @mixes HandlebarsApplication
 * @property {TeriockDocument} document
 */
export default class TeriockDocumentSheet extends BaseSheetMixin(HandlebarsApplicationMixin(DocumentSheetV2)) {}
