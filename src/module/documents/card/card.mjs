import * as documentMixins from "../mixins/_module.mjs";

const { Card } = foundry.documents;

/**
 * The Teriock Card implementation.
 * @extends {Card}
 * @extends {ClientDocument}
 * @mixes BaseDocument
 * @implements {Teriock.Documents.CardInterface}
 */
export default class TeriockCard extends documentMixins.BaseDocumentMixin(Card) {}
