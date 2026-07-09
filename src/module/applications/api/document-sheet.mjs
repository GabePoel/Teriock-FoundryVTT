import { mixClasses } from "../../helpers/construction.mjs";
import { BaseDocumentSheetMixin } from "./mixins/_module.mjs";

const { DocumentSheetV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * @extends {DocumentSheetV2}
 * @mixes HandlebarsApplication
 * @property {TeriockDocument} document
 */
export default class TeriockDocumentSheet
  extends mixClasses(DocumentSheetV2, HandlebarsApplicationMixin, BaseDocumentSheetMixin)
{}
