import { mixClasses } from "../../helpers/construction.mjs";
import { BaseDocumentMixin } from "../mixins/_module.mjs";

const { Scene } = foundry.documents;

/**
 * The Teriock Scene implementation.
 * @extends {Scene}
 * @mixes BaseDocument
 */
export default class TeriockScene
  extends mixClasses(/** @type {Teriock.Documents.SceneBase} */ (Scene), BaseDocumentMixin)
{}
