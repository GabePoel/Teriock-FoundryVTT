import { BaseDocumentMixin } from "../mixins/_module.mjs";

const { Card } = foundry.documents;

//noinspection JSClosureCompilerSyntax
/**
 * The Teriock {@link Cards} implementation.
 * @extends {ClientDocument}
 * @extends {Cards}
 * @mixes BaseDocument
 * @property {TypeCollection<TeriockCard, TeriockCard>} cards
 */
export default class TeriockCards extends BaseDocumentMixin(Card) {}
