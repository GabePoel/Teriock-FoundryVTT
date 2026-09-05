import { ConstructionNode } from "../../_module.mjs";
import { TeriockTextEditor } from "../../../../applications/ux/_module.mjs";
import { mixClasses } from "../../../../helpers/construction.mjs";
import { PseudoCollectionField } from "../../../fields/_module.mjs";
import { CritMechanicMixin, SelectionPseudoDocumentMixin } from "../../mixins/_module.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";

const { fields } = foundry.data;

export default class ConstructDocumentsAutomation
  extends mixClasses(BaseAutomation, CritMechanicMixin, SelectionPseudoDocumentMixin)
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.PSEUDOS.Selection"];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.ConstructDocuments.LABEL";
  }

  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, { pseudos: { ConstructionNode: "constructionNodes" } });
  }

  /** @inheritDoc */
  static get TYPE() {
    return "constructDocuments";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      constructionNodes: new PseudoCollectionField(ConstructionNode),
      makeSeparateActivations: new fields.BooleanField(),
      selectInExecution: new fields.BooleanField(),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["selectInExecution", "makeSeparateActivations", "hr"];
  }

  /** @inheritDoc */
  async getEditor(config) {
    const editor = await super.getEditor(config);
    const childEditorElements = await Promise.all(
      this.constructionNodes.filter(n => !n.parentNode).map(n => n.getEditor(config)),
    );
    const html = await TeriockTextEditor.renderTemplate("teriock/ui/construction-node-content", {
      childEditors: childEditorElements.map(() => ""),
      formEditor: "",
      parentUuid: this.uuid,
    });
    const container = foundry.utils.parseHTML(html);
    container.querySelector(".construction-node-editor")?.replaceChildren(editor);
    const listItemElements = container.querySelectorAll(".construction-node-list-item");
    childEditorElements.forEach((childEditor, i) => listItemElements[i]?.replaceChildren(childEditor));
    return container;
  }
}
