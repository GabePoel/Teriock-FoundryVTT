import { mixClasses } from "../../helpers/construction.mjs";
import { BaseDocumentMixin } from "../mixins/_module.mjs";

const { Card } = foundry.documents;

/**
 * The Teriock Card implementation.
 * @mixes BaseDocument
 */
export default class TeriockCard extends mixClasses(Card, BaseDocumentMixin) {}
