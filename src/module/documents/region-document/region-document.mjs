import { mixClasses } from "../../helpers/construction.mjs";
import { BaseDocumentMixin } from "../mixins/_module.mjs";

const { RegionDocument } = foundry.documents;

/**
 * @mixes BaseDocument
 */
export default class TeriockRegionDocument extends mixClasses(RegionDocument, BaseDocumentMixin) {}
