import effectConfig from "../../../../constants/config/effect-config.mjs";
import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { mixClasses } from "../../../../helpers/construction.mjs";
import { objectMap, omit } from "../../../../helpers/utils.mjs";
import { TypedIdentifierSetField } from "../../../fields/_module.mjs";
import { defaultJSONField } from "../../../fields/tools/builders.mjs";
import { AddDocumentsActivation } from "../../activations/_module.mjs";
import {
  CritMechanicMixin,
  OverrideCompetencePseudoDocumentMixin,
  OverrideDataPseudoDocumentMixin,
  SelectionPseudoDocumentMixin,
} from "../../mixins/_module.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";
import * as automationMixins from "../mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @mixes CritMechanic
 * @mixes SelectionPseudoDocument
 * @mixes OverrideCompetenceMechanic
 * @mixes OverrideDataPseudoDocument
 * @mixes DisplayAutomation
 * @mixes TriggerAutomation
 */
export default class AddDocumentsAutomation
  extends mixClasses(
    CritMechanicMixin(BaseAutomation),
    SelectionPseudoDocumentMixin,
    OverrideCompetencePseudoDocumentMixin,
    OverrideDataPseudoDocumentMixin,
    automationMixins.DisplayAutomationMixin,
    automationMixins.TriggerAutomationMixin,
  )
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.AddDocuments"];

  /** @inheritDoc */
  static get metadata() {
    return Object.assign(super.metadata, { type: "addDocuments" });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(omit(super.defineSchema(), ["expandFolders", "expandTables"]), {
      attachDocuments: new fields.BooleanField({ initial: true }),
      children: new fields.SchemaField({
        data: defaultJSONField(),
        enabled: new fields.BooleanField({ initial: false }),
        identifiers: new TypedIdentifierSetField(),
        overrideData: new fields.BooleanField({ initial: false }),
        uuids: new fields.SetField(new fields.DocumentUUIDField()),
      }),
      separate: new fields.BooleanField({ initial: false }),
      target: new fields.StringField({
        blank: false,
        choices: objectMap(effectConfig.applicationTargets, e => e.label, { localize: true }),
        initial: "actor",
        nullable: false,
        required: true,
      }),
    });
  }

  /**
   * Determine the label for an activation from a construction.
   * @param {DocumentConstruction} construction
   */
  #inferLabel(construction) {
    let name = _loc("TERIOCK.AUTOMATIONS.AddDocuments.BUTTONS.default");
    const inferred = foundry.utils.getProperty(construction, "data.name");
    if (inferred !== undefined && !/@\w/.test(inferred)) {
      name = _loc("TERIOCK.AUTOMATIONS.AddDocuments.BUTTONS.inferred", { name: inferred });
    }
    return name;
  }

  /**
   * Build the construction for a single document, which is only known ahead of time when the
   * selection isn't left for the created activation to make.
   * @param {TeriockDocument|null} document
   * @param {object} [options]
   * @returns {DocumentConstruction}
   */
  #makeConstruction(document, options = {}) {
    const data = foundry.utils.expandObject({ "system.competence.raw": this.getCompetence(options) });
    if (this.overrideData && this.data) { foundry.utils.mergeObject(data, this.data, { inplace: true }); }
    const construction = { data, uuid: document?.uuid };
    if (document) { this.#updateConstructionName(construction); }
    return construction;
  }

  /**
   * Update the name of the document construction.
   * @param {DocumentConstruction} construction
   */
  #updateConstructionName(construction) {
    let uuidName;
    let name;
    if (construction.uuid) {
      const index = fromUuidSync(construction.uuid);
      if (index) { uuidName = index.name; }
      name = uuidName;
    }
    if (foundry.utils.hasProperty(construction, "data.name")) {
      name = BaseRoll.replaceFormulaData(construction.data.name, { base: uuidName });
    }
    if (name) { foundry.utils.setProperty(construction, "data.name", name); }
  }

  /**
   * Attachment paths.
   * @returns {string[]}
   */
  get _attachmentPaths() {
    if (this.document?.type !== "ability") { return this._triggerDisplayPaths; }
    const paths = ["separate"];
    if (this.separate) {
      paths.push("target");
      paths.push(...this._triggerDisplayPaths);
    } else { paths.push("attachDocuments"); }
    return paths;
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

  /** @inheritDoc */
  async _getActivations(options = {}) {
    if (!this.hasActivations) { return []; }
    const selections = await this._getSelections({
      relativeTo: options.execution?.actor ?? options.actor ?? this.actor,
    });
    return selections.map(({ config, document }) => {
      const family = { root: this.#makeConstruction(document, options) };
      if (this.children.enabled) {
        const uuids = [
          ...Array.from(this.children.uuids),
          ...Array.from(this.children.identifiers).map(i => game.teriock.identifiers.get(i)).filter(Boolean),
        ];
        family.children = uuids.map(uuid => {
          return { data: this.children.overrideData ? this.children.data : {}, uuid };
        });
      }
      return new AddDocumentsActivation({
        ...config,
        display: { label: this.display.label || this.#inferLabel(family.root) },
        primary: family,
        secondary: family,
        target: this.target,
      });
    });
  }

  /** @inheritDoc */
  _isSelectable(document) {
    return Boolean(document?.uuid);
  }

  /** @inheritDoc */
  _makeFormGroup(path, groupConfig = {}, inputConfig = {}, config = {}) {
    if (path === "children.data") { groupConfig.stacked = true; }
    return super._makeFormGroup(path, groupConfig, inputConfig, config);
  }

  /**
   * Constructions for the documents this adds as part of the main effect, rather than as its own
   * activation. The selection is always made during the execution here.
   * @param {object} [options]
   * @param {TeriockActor} [options.actor]
   * @param {BaseExecution} [options.execution]
   * @return {Promise<Teriock.System.Attachment<TeriockActiveEffect|TeriockItem>[]>}
   */
  async choose(options = {}) {
    const documents = await this.selectDocuments({
      relativeTo: options.execution?.actor ?? options.actor ?? this.actor,
    });
    return documents.map(d => this.#makeConstruction(d, options));
  }
}
