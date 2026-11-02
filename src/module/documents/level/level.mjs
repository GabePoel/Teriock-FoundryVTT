import { mixClasses } from "../../utils/_module.mjs";
import { BaseDocumentMixin, TerrainDocumentMixin } from "../mixins/_module.mjs";

const { Level } = foundry.documents;

/**
 * The Teriock Level implementation.
 * @extends {Level}
 * @mixes BaseDocument
 * @mixes TerrainDocument
 */
export default class TeriockLevel extends mixClasses(Level, BaseDocumentMixin, TerrainDocumentMixin) {
  /**
   * Tokens located in this level.
   * @returns {TeriockTokenDocument[]}
   */
  get tokens() {
    return this.parent?.tokens.filter(t => t.locatedInLevel(this)) ?? [];
  }
}
