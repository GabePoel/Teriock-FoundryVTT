import * as documentMixins from "../mixins/_module.mjs";

const { Card } = foundry.documents;

/**
 * The Teriock Card implementation.
 * @implements {Teriock.Documents.CardInterface}
 * @extends {ClientDocument}
 * @extends {Card}
 * @mixes BaseDocument
 */
export default class TeriockCard extends documentMixins.BaseDocumentMixin(Card) {}
