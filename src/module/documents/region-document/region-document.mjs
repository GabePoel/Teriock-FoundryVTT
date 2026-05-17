import { mixClasses } from "../../helpers/construction.mjs";
import * as mixins from "../mixins/_module.mjs";

const { RegionDocument } = foundry.documents;

/**
 * @extends {RegionDocument}
 * @extends {ClientDocument}
 * @mixes BaseDocument
 * @implements {Teriock.Documents.RegionDocumentInterface}
 */
export default class TeriockRegionDocument extends mixClasses(RegionDocument, mixins.BaseDocumentMixin) {}
