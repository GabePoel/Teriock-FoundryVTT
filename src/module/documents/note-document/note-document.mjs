import { mixClasses } from "../../helpers/construction.mjs";
import * as documentMixins from "../mixins/_module.mjs";

const { NoteDocument } = foundry.documents;

/**
 * The Teriock NoteDocument implementation.
 * @extends {NoteDocument}
 * @extends {ClientDocument}
 * @mixes BaseDocument
 * @mixes EtherealDocument
 */
export default class TeriockNoteDocument extends mixClasses(
  NoteDocument,
  documentMixins.BaseDocumentMixin,
  documentMixins.EtherealDocumentMixin,
) {}
