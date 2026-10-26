import { mixClasses } from "../../utils/_module.mjs";
import { BaseDocumentMixin } from "../mixins/_module.mjs";

const { AmbientLightDocument } = foundry.documents;

/**
 * The Teriock AmbientLightDocument implementation.
 * @extends {AmbientLightDocument}
 * @mixes BaseDocument
 */
export default class TeriockAmbientLightDocument extends mixClasses(AmbientLightDocument, BaseDocumentMixin) {
  /**
   * @inheritDoc
   * @category Ethereal
   */
  prepareBaseData() {
    super.prepareBaseData();
    if (typeof this.getFlag("teriock", "isEthereal") !== "boolean") {
      foundry.utils.setProperty(this, "flags.teriock.isEthereal", false);
    }
  }
}
