import { ConstructionNode } from "../../_module.mjs";
import { TeriockTextEditor } from "../../../../applications/ux/_module.mjs";
import effectConfig from "../../../../constants/config/effect-config.mjs";
import { mixClasses } from "../../../../helpers/construction.mjs";
import { toId } from "../../../../helpers/string.mjs";
import { deleteProperties, objectMap } from "../../../../helpers/utils.mjs";
import { PseudoCollectionField } from "../../../fields/_module.mjs";
import { AddDocumentsActivation } from "../../activations/_module.mjs";
import { ConstructNodesPseudoDocumentMixin, CritMechanicMixin } from "../../mixins/_module.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";
import { DisplayAutomationMixin, TriggerAutomationMixin } from "../mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @mixes CritMechanic
 * @mixes DisplayAutomation
 * @mixes TriggerAutomation
 */
export default class AddDocumentsAutomation
  extends mixClasses(
    BaseAutomation,
    CritMechanicMixin,
    DisplayAutomationMixin,
    TriggerAutomationMixin,
    ConstructNodesPseudoDocumentMixin,
  )
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.PSEUDOS.Selection",
    "TERIOCK.AUTOMATIONS.AddDocuments",
  ];

  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      pseudos: { ConstructionNode: "constructionNodes" },
      type: "addDocuments",
    });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      all: new fields.BooleanField({ initial: true }),
      attachToEffect: new fields.BooleanField({ initial: true }),
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
  static migrateData(source, options) {
    const oldProperties = [
      "attachDocuments",
      "children",
      "competence",
      "data",
      "globalIdentifiers",
      "globalUuids",
      "localIdentifiers",
      "localQualifier",
      "localUuids",
      "makeSeparateActivations",
      "overrideData",
      "separate",
      "setCompetence",
    ];
    if (!source.constructionNodes || oldProperties.some(p => p in source)) {
      const baseIdKey = `${source._id}-addDocuments`;
      const rootId = toId(`${baseIdKey}-root`, { hash: true });
      const nodes = {
        [rootId]: {
          _id: rootId,
          all: source.all,
          auto: source.auto,
          competence: source.competence,
          data: source.data,
          globalIdentifiers: source.globalIdentifiers,
          globalUuids: source.globalUuids,
          localIdentifiers: source.localIdentifiers,
          localQualifier: source.localQualifier,
          localUuids: source.localUuids,
          multi: source.multi,
          overrideData: source.overrideData,
          parentId: null,
          setCompetence: source.setCompetence,
          type: "base",
        },
      };
      if (source.children?.enabled) {
        const childId = toId(`${baseIdKey}-children`, { hash: true });
        nodes[childId] = {
          _id: childId,
          all: true,
          auto: true,
          data: source.children.data,
          globalIdentifiers: source.children.identifiers,
          globalUuids: source.children.uuids,
          multi: true,
          overrideData: source.children.overrideData,
          parentId: rootId,
          type: "base",
        };
      }
      source.constructionNodes = nodes;
      source.attachToEffect = !source.separate;
      deleteProperties(source, "all", "auto", "multi");
    }
    deleteProperties(source, ...oldProperties);
    return super.migrateData(source, options);
  }

  /** @inheritDoc */
  get _formPaths() {
    const paths = [];
    if (this.canAttachToEffect) { paths.push("attachToEffect"); }
    if (!this.attachToEffect) { paths.push(...this._triggerDisplayPaths, "target"); }
    paths.push(...["hr", "selectInExecution", "all"]);
    if (!this.all) { paths.push(...["auto", "multi"]); }
    paths.push("hr");
    return paths;
  }

  /**
   * Whether this can attach to a generated effect.
   * @returns {boolean}
   */
  get canAttachToEffect() {
    // TODO: Consider changing this if effect generation is ever generalized to not just be abilities.
    return this.document?.type === "ability" && this.document?.system?.maneuver !== "passive";
  }

  /** @inheritDoc */
  async _getActivations(options = {}) {
    if (this.attachToEffect) { return []; }
    const roots = this.selectInExecution ? await this.getNodes() : this.rootNodes;
    let nodes = roots.flatMap(n => [n, ...n.allChildNodes.contents]);
    if (this.selectInExecution) {
      nodes = await Promise.all(nodes.map(n => n.getDeterministicCopy(options)));
    }
    return [
      new AddDocumentsActivation({
        all: this.all,
        auto: this.auto,
        constructionNodes: ConstructionNode.toCollectionObject(nodes.map(n => n.toObject()), { keepId: true }),
        display: this.display,
        multi: this.multi,
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

  /** @inheritDoc */
  prepareData() {
    super.prepareData();
    if (!this.canAttachToEffect) { this.attachToEffect = false; }
  }
}
