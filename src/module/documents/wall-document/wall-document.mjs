import { mixClasses } from "../../helpers/construction.mjs";
import * as documentMixins from "../mixins/_module.mjs";

const { WallDocument } = foundry.documents;

/**
 * The Teriock WallDocument implementation.
 * @extends {WallDocument}
 * @extends {ClientDocument}
 * @mixes BaseDocument
 * @mixes EtherealDocument
 */
export default class TeriockWallDocument extends mixClasses(
  WallDocument,
  documentMixins.BaseDocumentMixin,
  documentMixins.EtherealDocumentMixin,
) {}
