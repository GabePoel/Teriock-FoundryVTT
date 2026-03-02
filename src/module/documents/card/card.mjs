import { BaseDocumentMixin } from "../mixins/_module.mjs";

const { Card } = foundry.documents;

//noinspection JSClosureCompilerSyntax
/**
 * The Teriock Card implementation.
 * @implements {Teriock.Documents.CardInterface}
 * @extends {ClientDocument}
 * @extends {Card}
 * @mixes BaseDocument
 */
export default class TeriockCard extends BaseDocumentMixin(Card) {}
