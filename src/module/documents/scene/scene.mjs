import { mixClasses } from "../../helpers/construction.mjs";
import { BaseDocumentMixin } from "../mixins/_module.mjs";

const { Scene } = foundry.documents;

/**
 * The Teriock Scene implementation.
 * @mixes BaseDocument
 */
export default class TeriockScene extends mixClasses(Scene, BaseDocumentMixin) {}
