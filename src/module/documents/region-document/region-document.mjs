import { mixClasses } from "../../helpers/construction.mjs";
import * as documentMixins from "../mixins/_module.mjs";

const { RegionDocument } = foundry.documents;

/**
 * @mixes BaseDocument
 */
export default class TeriockRegionDocument extends mixClasses(RegionDocument, documentMixins.BaseDocumentMixin) {}
