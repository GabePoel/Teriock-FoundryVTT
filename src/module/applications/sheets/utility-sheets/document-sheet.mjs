import BaseSheetMixin from "../mixins/base-sheet-mixin.mjs";

const { DocumentSheetV2, HandlebarsApplicationMixin } =
  foundry.applications.api;

//noinspection JSValidateJSDoc
/**
 * @extends {DocumentSheetV2}
 * @mixes HandlebarsApplication
 */
export default class TeriockDocumentSheet extends BaseSheetMixin(
  HandlebarsApplicationMixin(DocumentSheetV2),
) {}
