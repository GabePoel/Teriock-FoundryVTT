import { mixClasses } from "../../helpers/construction.mjs";
import { BaseDocumentMixin } from "../mixins/_module.mjs";

const { AmbientLightDocument } = foundry.documents;

/**
 * The Teriock AmbientLightDocument implementation.
 * @mixes BaseDocument
 */
export default class TeriockAmbientLightDocument extends mixClasses(AmbientLightDocument, BaseDocumentMixin) {
  /** @inheritDoc */
  prepareBaseData() {
    super.prepareBaseData();
    if (typeof this.getFlag("teriock", "isEthereal") !== "boolean") {
      foundry.utils.setProperty(this, "flags.teriock.isEthereal", false);
    }
  }
}
