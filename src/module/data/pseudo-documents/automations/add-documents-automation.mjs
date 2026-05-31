import { mixClasses } from "../../../helpers/construction.mjs";
import { TypedIdentifierSetField } from "../../fields/_module.mjs";
import { defaultJSONField } from "../../fields/helpers/builders.mjs";
import { AddDocumentsActivation } from "../activations/_module.mjs";
import { CritAutomation } from "./abstract/_module.mjs";
import * as automationMixins from "./mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @param {boolean} attachDocuments
 * @extends {CritAutomation}
 * @mixes SelectDocumentsAutomation
 * @mixes CompetenceAutomation
 * @mixes OverrideDataAutomation
 * @property {boolean} separate
 * @property {boolean} attachDocuments
 * @property {{enabled: boolean, data: object, overrideData: boolean, uuids: Set<UUID<AnyChildDocument>>[]}} children
 */
export default class AddDocumentsAutomation
  extends mixClasses(
    CritAutomation,
    automationMixins.SelectDocumentsAutomationMixin,
    automationMixins.CompetenceAutomationMixin,
    automationMixins.OverrideDataAutomationMixin,
    automationMixins.DisplayAutomationMixin,
  )
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.AddDocuments"];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.AUTOMATIONS.AddDocuments.LABEL";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "addDocuments";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      attachDocuments: new fields.BooleanField({ initial: true }),
      children: new fields.SchemaField({
        data: defaultJSONField(),
        enabled: new fields.BooleanField({ initial: false }),
        identifiers: new TypedIdentifierSetField(),
        overrideData: new fields.BooleanField({ initial: false }),
        uuids: new fields.SetField(new fields.DocumentUUIDField()),
      }),
      separate: new fields.BooleanField({ initial: false }),
    });
  }

  /**
   * Determine the label for an activation from a construction.
   * @param {DocumentConstruction} construction
   */
  #inferLabel(construction) {
    let name = _loc("TERIOCK.AUTOMATIONS.AddDocuments.BUTTONS.default");
    if (foundry.utils.hasProperty(construction, "data.name")) {
      name = _loc("TERIOCK.AUTOMATIONS.AddDocuments.BUTTONS.inferred", { name: construction.data.name });
    }
    return name;
  }

  /**
   * Update the name of the document construction.
   * @param {DocumentConstruction} construction
   */
  #updateConstructionName(construction) {
    let uuidName;
    let dataName;
    let name;
    if (construction.uuid) {
      const index = fromUuidSync(construction.uuid);
      if (index) { uuidName = index.name; }
      name = uuidName;
    }
    if (foundry.utils.hasProperty(construction, "data.name")) {
      dataName = construction.data.name;
      name = dataName;
    }
    if (dataName?.includes("{name}")) { name = dataName.replace("{name}", uuidName || ""); }
    if (name) { foundry.utils.setProperty(construction, "data.name", name); }
  }

  /**
   * Attachment paths.
   * @returns {string[]}
   */
  get _attachmentPaths() {
    if (this.document?.type !== "ability") { return ["display.label"]; }
    return ["separate", this.separate ? "display.label" : "attachDocuments"];
  }

  /**
   * Children paths.
   * @returns {string[]}
   */
  get _childrenPaths() {
    const paths = ["children.enabled"];
    if (this.children.enabled) {
      paths.push(...["children.identifiers", "children.uuids", "children.overrideData"]);
      if (this.children.overrideData) { paths.push("children.data"); }
    }
    return paths;
  }

  /** @inheritDoc */
  get _formPaths() {
    return [
      ...this._selectionPaths,
      "hr",
      ...this._attachmentPaths,
      ...this._competencePaths,
      ...this._overrideDataPaths,
      "hr",
      ...this._childrenPaths,
    ];
  }

  /** @inheritDoc */
  get canCrit() {
    return !this.separate && super.canCrit;
  }

  /**
   * Whether this is separate from the ability's main effect.
   * @returns {boolean}
   */
  get hasActivations() {
    return this.document.type !== "ability" || this.separate;
  }

  /**
   * @inheritDoc
   * @param {object} [options]
   * @param {AnyActor} [options.actor]
   * @return {Promise<Teriock.System.Attachment<AnyChildDocument>[]>}
   */
  async choose(options = {}) {
    const uuids = await super.choose(options);
    return uuids.map(uuid => {
      const data = foundry.utils.expandObject({
        "system.competence.raw": this.overrideCompetence
          ? this.competence.raw
          : this.document?.system?.competence?.value,
      });
      if (this.overrideData && this.data) { foundry.utils.mergeObject(data, this.data, { inplace: true }); }
      const construction = { data, uuid };
      this.#updateConstructionName(construction);
      return construction;
    });
  }

  /** @inheritDoc */
  async getActivations() {
    if (!this.hasActivations) { return []; }
    const choices = await this.choose();
    const activations = [];
    for (const choice of choices) {
      const activationFamily = { root: choice };
      if (this.children.enabled) {
        const uuids = [
          ...Array.from(this.children.uuids),
          ...Array.from(this.children.identifiers).map(i => game.teriock.identifiers.get(i)).filter(Boolean),
        ];
        activationFamily.children = uuids.map(uuid => {
          return { data: this.children.overrideData ? this.children.data : {}, uuid };
        });
      }
      const activationData = {
        display: { label: this.display.label || this.#inferLabel(activationFamily.root) },
        primary: activationFamily,
        secondary: activationFamily,
      };
      activations.push(new AddDocumentsActivation(activationData));
    }
    return activations;
  }

  /** @inheritDoc */
  async getDocuments(options = {}) {
    return (await super.getDocuments(options)).filter(d => d && d.uuid);
  }
}
