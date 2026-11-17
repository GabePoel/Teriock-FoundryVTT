import { mixClasses } from "../../utils/_module.mjs";
import { BaseDocumentMixin } from "../mixins/_module.mjs";

const { Card } = foundry.documents;

/**
 * The Teriock Card implementation.
 * @extends {Card}
 * @mixes BaseDocument
 */
export default class TeriockCard extends mixClasses(Card, BaseDocumentMixin) {}
