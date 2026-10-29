import { mergeMetadata, mixClasses } from "../../../../utils/_module.mjs";
import { SelectionPseudoDocumentMixin } from "../../mixins/_module.mjs";
import { BaseActivation } from "../abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * @extends {BaseActivation}
 * @mixes SelectionPseudoDocument
 */
export default class UseDocumentsActivation extends mixClasses(BaseActivation, SelectionPseudoDocumentMixin) {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    icon: TERIOCK.DISPLAY.icons.manifest.ui.document,
    type: "useDocuments",
  });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), { options: new fields.ObjectField() });
  }

  /** @inheritDoc */
  get _selectionTitle() {
    return this.label;
  }

  /** @inheritDoc */
  _isSelectable(document) {
    return typeof document?.use === "function";
  }

  /** @inheritDoc */
  async primaryAction() {
    if (!this.checkActors()) { return; }
    const documents = await this.selectDocuments();
    if (!documents) { return; }
    for (const actor of this.actors) {
      await Promise.all(documents.map(d => d.use({ ...this.options, actor, event: this.event })));
    }
  }
}
