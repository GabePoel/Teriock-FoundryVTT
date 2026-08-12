import * as documentMixins from "../mixins/_module.mjs";

const { Card } = foundry.documents;

/**
 * The Teriock Card implementation.
 * @mixes BaseDocument
 */
export default class TeriockCard extends documentMixins.BaseDocumentMixin(Card) {}
