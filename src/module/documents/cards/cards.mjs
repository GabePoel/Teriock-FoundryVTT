import * as documentMixins from "../mixins/_module.mjs";

const { Card } = foundry.documents;

/**
 * The Teriock Cards implementation.
 * @implements {Teriock.Documents.CardsInterface}
 * @extends {ClientDocument}
 * @extends {Cards}
 * @mixes BaseDocument
 * @property {DocumentCollection<TeriockCard>} cards
 */
export default class TeriockCards extends documentMixins.BaseDocumentMixin(Card) {}
