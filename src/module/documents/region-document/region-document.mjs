import { mixClasses } from "../../utils/_module.mjs";
import { BaseDocumentMixin } from "../mixins/_module.mjs";

const { RegionDocument } = foundry.documents;

/**
 * @extends {RegionDocument}
 * @mixes BaseDocument
 */
export default class TeriockRegionDocument extends mixClasses(RegionDocument, BaseDocumentMixin) {}
