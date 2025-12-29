const { DocumentSheetV2, HandlebarsApplicationMixin } =
  foundry.applications.api;

//noinspection JSValidateJSDoc
/**
 * @extends {DocumentSheetV2}
 * @mixes HandlebarsApplication
 */
export default class TeriockDocumentSheet extends HandlebarsApplicationMixin(
  DocumentSheetV2,
) {}
