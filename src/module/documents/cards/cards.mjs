import { BaseDocumentMixin } from "../mixins/_module.mjs";

const { Card } = foundry.documents;

//noinspection JSClosureCompilerSyntax
/**
 * The Teriock Cards implementation.
 * @implements {Teriock.Documents.CardsInterface}
 * @extends {ClientDocument}
 * @extends {Cards}
 * @mixes BaseDocument
 * @property {DocumentCollection<TeriockCard>} cards
 */
export default class TeriockCards extends BaseDocumentMixin(Card) {}
