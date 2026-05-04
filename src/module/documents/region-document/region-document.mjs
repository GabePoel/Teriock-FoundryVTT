import { mix } from "../../helpers/construction.mjs";
import * as mixins from "../mixins/_module.mjs";

const { RegionDocument } = foundry.documents;

//noinspection JSClosureCompilerSyntax
/**
 * @extends {RegionDocument}
 * @extends {ClientDocument}
 * @mixes BaseDocument
 * @implements {Teriock.Documents.RegionDocumentInterface}
 */
export default class TeriockRegionDocument extends mix(
  RegionDocument,
  mixins.BaseDocumentMixin,
) {}
