import { ConstructionNode } from "../../_module.mjs";
import { DocumentSelector } from "../../../../applications/dialogs/_module.mjs";
import { TeriockTextEditor } from "../../../../applications/ux/_module.mjs";
import effectConfig from "../../../../constants/config/effect-config.mjs";
import { mixClasses } from "../../../../helpers/construction.mjs";
import { objectMap } from "../../../../helpers/utils.mjs";
import { PseudoCollectionField } from "../../../fields/_module.mjs";
import { ConstructDocumentsActivation } from "../../activations/_module.mjs";
import { CritMechanicMixin } from "../../mixins/_module.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";
import { DisplayAutomationMixin, TriggerAutomationMixin } from "../mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @mixes CritMechanic
 * @mixes DisplayAutomation
 * @mixes TriggerAutomation
 */
export default class ConstructDocumentsAutomation
  extends mixClasses(BaseAutomation, CritMechanicMixin, DisplayAutomationMixin, TriggerAutomationMixin)
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.PSEUDOS.Selection",
    "TERIOCK.AUTOMATIONS.ConstructDocuments",
  ];

  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      pseudos: { ConstructionNode: "constructionNodes" },
      type: "constructDocuments",
    });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      all: new fields.BooleanField({ initial: true }),
      attachToEffect: new fields.BooleanField(),
      auto: new fields.BooleanField({ initial: true }),
      constructionNodes: new PseudoCollectionField(ConstructionNode),
      multi: new fields.BooleanField({ initial: false }),
      selectInExecution: new fields.BooleanField(),
      target: new fields.StringField({
        blank: false,
        choices: objectMap(effectConfig.applicationTargets, e => e.label, { localize: true }),
        initial: "actor",
        nullable: false,
        required: true,
      }),
    });
  }

  /** @inheritDoc */
  get _formPaths() {
    const paths = ["attachToEffect"];
    if (!this.attachToEffect) { paths.push(...[...this._triggerDisplayPaths], "target"); }
    paths.push(...["hr", "selectInExecution", "all"]);
    if (!this.all) { paths.push(...["auto", "multi"]); }
    paths.push("hr");
    return paths;
  }

  /**
   * The root nodes.
   * @returns {ConstructionNode[]}
   */
  get rootNodes() {
    return this.constructionNodes.filter(n => !n.parentNode);
  }

  /** @inheritDoc */
  async _getActivations(options = {}) {
    const nodes = await this.getNodes(options);
    return [
      new ConstructDocumentsActivation({
        constructionNodes: ConstructionNode.toCollectionObject(nodes.map(n => n.toObject())),
        display: this.display,
        target: this.target,
      }),
    ];
  }

  /** @inheritDoc */
  async getEditor(config) {
    const editor = await super.getEditor(config);
    const childEditorElements = await Promise.all(this.rootNodes.map(n => n.getEditor(config)));
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

  /**
   * Get the construction nodes to build with.
   * @param {object} options
   * @returns {Promise<ConstructionNode[]>}
   */
  async getNodes(options) {
    let nodes = this.rootNodes;
    if (this.selectInExecution) {
      if (!this.all) {
        nodes = await DocumentSelector.selectMulti(nodes, { auto: this.auto, multi: this.multi, silent: true });
      }
      nodes = await Promise.all(nodes.map(n => n.getDeterministicCopy(options)));
    }
    return nodes;
  }
}
