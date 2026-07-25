import * as documentMixins from "../mixins/_module.mjs";

const { Cards } = foundry.documents;

/**
 * The Teriock Cards implementation.
 * @extends {Cards}
 * @extends {ClientDocument}
 * @mixes BaseDocument
 * @implements {Teriock.Documents.CardsInterface}
 * @property {DocumentCollection<TeriockCard>} cards
 */
export default class TeriockCards extends documentMixins.BaseDocumentMixin(Cards) {}
