import { mixClasses } from "../../../../helpers/construction.mjs";
import { omit } from "../../../../helpers/utils.mjs";
import { RegionActivation } from "../../activations/_module.mjs";
import { OverrideDataPseudoDocumentMixin, SelectionPseudoDocumentMixin } from "../../mixins/_module.mjs";
import { TriggerAutomationMixin } from "../mixins/_module.mjs";
import TargetAutomation from "../target-automation/target-automation.mjs";

const { fields } = foundry.data;

/**
 * A region that is placed from a button.
 * @mixes SelectionPseudoDocument
 * @mixes TriggerAutomation
 * @mixes OverrideDataPseudoDocument
 */
export default class RegionAutomation
  extends mixClasses(
    TargetAutomation,
    SelectionPseudoDocumentMixin,
    TriggerAutomationMixin,
    OverrideDataPseudoDocumentMixin,
  )
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Region"];

  /** @inheritdoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, { tags: { interactInExecution: true }, type: "region" });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(omit(super.defineSchema(), ["expandFolders", "expandTables"]), {
      deleteOnTurnChange: new fields.BooleanField({ initial: true }),
      visibility: new fields.NumberField({
        choices: Object.fromEntries(
          Object.entries(CONST.REGION_VISIBILITY).map(([k, v]) => [v, _loc(`REGION.VISIBILITY.${k}.label`)]),
        ),
        initial: CONST.REGION_VISIBILITY.ALWAYS,
        required: true,
      }),
    });
  }

  /** @type {{ config: object, document: TeriockDocument|null }|null} */
  #selection = null;

  /** @inheritdoc */
  get _formPaths() {
    return [
      ...super._formPaths,
      "visibility",
      "deleteOnTurnChange",
      "hr",
      ...this._triggerDisplayPaths,
      "hr",
      ...this._selectionPaths,
      "hr",
      ...this._overrideDataPaths,
    ];
  }

  /**
   * The activation that places this Automation's region.
   * @param {Teriock.Automations.GetActivationsOptions} [options]
   * @param {Teriock.Select.DocumentSelectionConfig} [selectionConfig] - Config for Documents the region should apply.
   * @returns {Promise<RegionActivation>}
   */
  async _buildRegionActivation(options = {}, selectionConfig = {}) {
    return new RegionActivation({
      ...selectionConfig,
      attachToToken: this.attachToToken,
      data: await this.getRegionData(options),
    });
  }

  /** @inheritDoc */
  async _getActivations(options = { rollData: {} }) {
    const selection = this.hasSelection
      ? this.#selection ?? await this._getSelection({ relativeTo: options.execution?.actor ?? this.actor })
      : { config: {} };
    if (!selection) { return []; }
    return [await this._buildRegionActivation(options, selection.config)];
  }

  /** @inheritDoc */
  async getRegionData(options = { execution: null, rollData: {} }) {
    return foundry.utils.mergeObject(await super.getRegionData(options), {
      displayMeasurements: false,
      flags: { teriock: { targetRegion: false } },
      highlightMode: "shapes",
      name: _loc("TERIOCK.AUTOMATIONS.Region.DATA.name", {
        name: options.execution?.source.name ?? this.document.name,
      }),
      ...this.data,
    });
  }

  /** @inheritDoc */
  async interactOnExecutionInput(execution) {
    this.#selection = this.interactInExecution && this.hasSelection
      ? await this._getSelection({ relativeTo: execution.actor })
      : null;
  }
}
