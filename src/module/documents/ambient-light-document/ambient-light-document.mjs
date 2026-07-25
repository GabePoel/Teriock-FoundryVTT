import { mixClasses } from "../../helpers/construction.mjs";
import * as documentMixins from "../mixins/_module.mjs";

const { AmbientLightDocument } = foundry.documents;

/**
 * The Teriock AmbientLightDocument implementation.
 * @extends {AmbientLightDocument}
 * @extends {ClientDocument}
 * @mixes BaseDocument
 */
export default class TeriockAmbientLightDocument
  extends mixClasses(AmbientLightDocument, documentMixins.BaseDocumentMixin)
{
  /** @inheritDoc */
  prepareBaseData() {
    super.prepareBaseData();
    if (typeof this.getFlag("teriock", "isEthereal") !== "boolean") {
      foundry.utils.setProperty(this, "flags.teriock.isEthereal", false);
    }
  }
}
