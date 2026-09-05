import { omit } from "../../../../helpers/utils.mjs";
import { SelectionPseudoDocumentMixin } from "../../mixins/_module.mjs";
import { BaseActivation } from "../abstract/_module.mjs";

const { fields } = foundry.data;

/**
 * @mixes SelectionPseudoDocument
 */
export default class UseDocumentsActivation extends SelectionPseudoDocumentMixin(BaseActivation) {
  /** @inheritDoc */
  static get metadata() {
    return Object.assign(super.metadata, { icon: TERIOCK.display.icons.ui.document, type: "useDocuments" });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(omit(super.defineSchema(), ["makeSeparateActivations", "selectInExecution"]), {
      options: new fields.ObjectField(),
    });
  }

  /** @inheritDoc */
  get _selectionRelativeTo() {
    return this.document?.speakerActor ?? null;
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
    for (const actor of this.actors) {
      await Promise.all(documents.map(d => d.use({ ...this.options, actor, event: this.event })));
    }
  }
}
