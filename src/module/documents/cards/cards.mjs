import * as documentMixins from "../mixins/_module.mjs";

const { Cards } = foundry.documents;

/**
 * The Teriock Cards implementation.
 * @mixes BaseDocument
 */
export default class TeriockCards extends documentMixins.BaseDocumentMixin(Cards) {}
