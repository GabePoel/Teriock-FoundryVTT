import { mixClasses } from "../../helpers/construction.mjs";
import { BaseDocumentMixin } from "../mixins/_module.mjs";

const { Cards } = foundry.documents;

/**
 * The Teriock Cards implementation.
 * @mixes BaseDocument
 */
export default class TeriockCards extends mixClasses(Cards, BaseDocumentMixin) {}
