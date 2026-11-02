import { mixClasses } from "../../utils/_module.mjs";
import { BaseDocumentMixin, TerrainDocumentMixin } from "../mixins/_module.mjs";

const { Scene } = foundry.documents;

/**
 * The Teriock Scene implementation.
 * @extends {Scene}
 * @mixes BaseDocument
 * @mixes TerrainDocument
 */
export default class TeriockScene
  extends mixClasses(/** @type {Teriock.Documents.SceneBase} */ (Scene), BaseDocumentMixin, TerrainDocumentMixin)
{}
