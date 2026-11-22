import { TeriockTextEditor } from "../../../../applications/ux/_module.mjs";
import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { createElement, mergeMetadata, mixClasses } from "../../../../utils/_module.mjs";
import { FormulaField, UnitField } from "../../../fields/_module.mjs";
import { localSelectionSchema } from "../../../fields/tools/builders.mjs";
import { EffectDurationUnitModel, RegionDurationUnitModel } from "../../../models/unit-models/_module.mjs";
import { RegionActivation } from "../../activations/_module.mjs";
import { OverrideDataPseudoDocumentMixin } from "../../mixins/_module.mjs";
import { SelectionAutomationMixin, TriggerAutomationMixin } from "../mixins/_module.mjs";
import TargetAutomation from "../target-automation/target-automation.mjs";

const { fields } = foundry.data;

/**
 * A region that is placed from a button.
 * @extends {TargetAutomation}
 * @mixes SelectionAutomation
 * @mixes TriggerAutomation
 * @mixes OverrideDataPseudoDocument
 */
export default class RegionAutomation
  extends mixClasses(
    TargetAutomation,
    SelectionAutomationMixin,
    TriggerAutomationMixin,
    OverrideDataPseudoDocumentMixin,
  )
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.AUTOMATIONS.Duration",
    "TERIOCK.AUTOMATIONS.Region",
  ];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { tags: { interactInExecution: true }, type: "region" });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), localSelectionSchema(), {
      applyDocuments: new fields.BooleanField({ initial: false }),
      behaviors: new fields.ArrayField(new fields.ObjectField()),
      deleteOnTurnChange: new fields.BooleanField({ initial: true }),
      duration: new UnitField(EffectDurationUnitModel),
      substitution: new FormulaField({ initial: "@base + @new" }),
      visibility: new fields.NumberField({
        choices: Object.fromEntries(
          Object.entries(CONST.REGION_VISIBILITY).map(([k, v]) => [v, _loc(`REGION.VISIBILITY.${k}.label`)]),
        ),
        initial: CONST.REGION_VISIBILITY.ALWAYS,
        required: true,
      }),
    });
  }

  /**
   * Get the duration for a region this creates.
   * @param {object} rollData
   * @returns {Promise<number|undefined>}
   */
  async #getDuration(rollData) {
    if (this.deleteOnTurnChange || this.duration.unitType !== "finite") { return undefined; }
    const document = this.getNearestDocument();
    const base = document?.system?.duration?.formula ?? document?.duration?.secondsRemaining ?? "0";
    const newFormula = await BaseRoll.getValue(this.duration.formula, rollData);
    const formula = BaseRoll.replaceFormulaData(this.substitution, { base, new: newFormula });
    const seconds = await BaseRoll.getValue(formula, rollData);
    return seconds < TERIOCK.CONST.INF / 10 ? seconds : undefined;
  }

  /**
   * Paths relating to duration.
   * @returns {string[]}
   */
  get _durationPaths() {
    const paths = ["deleteOnTurnChange"];
    if (this.deleteOnTurnChange) { return paths; }
    paths.push("duration");
    if (this.duration.unitType === "finite") { paths.push("substitution"); }
    return paths;
  }

  /** @inheritDoc */
  get _formPaths() {
    return [
      ...super._formPaths,
      "hr",
      ...this._durationPaths,
      "hr",
      "applyDocuments",
      ...(this.applyDocuments ? this._selectionPaths : []),
      "hr",
      ...this._overrideDataPaths,
    ];
  }

  /** @inheritDoc */
  get _restrictionPaths() {
    return [...super._restrictionPaths, "visibility"];
  }

  /** @inheritDoc */
  get hasSelection() {
    return this.applyDocuments && super.hasSelection;
  }

  /** @inheritDoc */
  async _getActivations(options = { rollData: {} }) {
    const selection = this.hasSelection ? await this._resolveSelection(options) : { config: {} };
    if (!selection) { return []; }
    return [
      new RegionActivation({
        ...selection.config,
        attachToToken: this.attachToToken,
        data: await this.getRegionData(options),
      }),
    ];
  }

  /** @inheritDoc */
  async getEditor(config = {}) {
    const editor = await super.getEditor(config);
    const editable = this.getNearestDocument()?.sheet?.isEditable;
    const html = await TeriockTextEditor.renderTemplate("templates/scene/parts/region-behaviors.hbs", {
      behaviors: this.behaviors.map((b, i) => ({
        canDelete: editable,
        canUpdate: editable,
        disabled: b.disabled,
        id: i,
        name: b.name,
        typeIcon: CONFIG.RegionBehavior.typeIcons[b.type] || "fas fa-notdef",
        typeLabel: _loc(CONFIG.RegionBehavior.typeLabels[b.type]),
      })),
      canCreateBehavior: editable,
      tab: { cssClass: "active", group: "regionBehaviors", id: "behaviors" },
    });
    const container = createElement("div", { className: "region-config teriock-full-width" });
    container.append(foundry.utils.parseHTML(html));
    editor.append(document.createElement("hr"), container);
    return editor;
  }

  /** @inheritDoc */
  async getRegionData(options = { execution: null, rollData: {} }) {
    const seconds = await this.#getDuration(options.rollData ?? options.execution?.getRollData() ?? {});
    return foundry.utils.mergeObject(await super.getRegionData(options), {
      behaviors: foundry.utils.deepClone(this.behaviors),
      displayMeasurements: false,
      flags: {
        teriock: {
          ...(Number.isFinite(seconds) ? { duration: RegionDurationUnitModel.castNumber(seconds) } : {}),
          targetRegion: false,
        },
      },
      highlightMode: "shapes",
      name: _loc("TERIOCK.AUTOMATIONS.Region.DATA.name", {
        name: options.execution?.source.name ?? this.getNearestDocument().name,
      }),
      ...this.data,
    });
  }
}
