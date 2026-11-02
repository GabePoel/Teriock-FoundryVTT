import { mergeMetadata, mixClasses, omit } from "../../../../utils/_module.mjs";
import { terrainSchema } from "../../../fields/tools/builders.mjs";
import { RegionActivation } from "../../activations/_module.mjs";
import { OverrideDataPseudoDocumentMixin, SelectionPseudoDocumentMixin } from "../../mixins/_module.mjs";
import { TriggerAutomationMixin } from "../mixins/_module.mjs";
import TargetAutomation from "../target-automation/target-automation.mjs";

const { fields } = foundry.data;

/**
 * A region that is placed from a button.
 * @extends {TargetAutomation}
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

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { tags: { interactInExecution: true }, type: "region" });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(omit(super.defineSchema(), ["expandFolders", "expandTables"]), {
      applyDocuments: new fields.BooleanField({ initial: false }),
      deleteOnTurnChange: new fields.BooleanField({ initial: true }),
      setTerrain: new fields.BooleanField({ initial: false }),
      terrain: new fields.SchemaField(terrainSchema()),
      visibility: new fields.NumberField({
        choices: Object.fromEntries(
          Object.entries(CONST.REGION_VISIBILITY).map(([k, v]) => [v, _loc(`REGION.VISIBILITY.${k}.label`)]),
        ),
        initial: CONST.REGION_VISIBILITY.ALWAYS,
        required: true,
      }),
    });
  }

  /** @inheritDoc */
  static migrateData(source, options) {
    if (!options.partial && !("applyDocuments" in source)) {
      source.applyDocuments = ["globalIdentifiers", "globalUuids", "localIdentifiers", "localUuids"].some(k =>
        source[k]?.length
      ) || Boolean(source.localQualifier);
    }
    return super.migrateData(source, options);
  }

  /**
   * The selection made during an execution. This is `undefined` if no selection has been made.
   * @type {{ config: object, document: TeriockDocument|null }|null|undefined}
   */
  #selection;

  /** @inheritDoc */
  get _formPaths() {
    return [
      ...super._formPaths,
      "visibility",
      "deleteOnTurnChange",
      "hr",
      "setTerrain",
      ...(this.setTerrain ? ["terrain.difficultTerrain", "terrain.terrains", "terrain.removedTerrains"] : []),
      "hr",
      "applyDocuments",
      ...(this.applyDocuments ? this._selectionPaths : []),
      "hr",
      ...this._overrideDataPaths,
    ];
  }

  /** @inheritDoc */
  get hasSelection() {
    return this.applyDocuments && super.hasSelection;
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
    let selection = { config: {} };
    if (this.hasSelection) {
      selection = this.#selection === undefined
        ? await this._getSelection({ relativeTo: options.execution?.actor ?? this.actor })
        : this.#selection;
    }
    if (!selection) { return []; }
    return [await this._buildRegionActivation(options, selection.config)];
  }

  /** @inheritDoc */
  async cleanupExecution() {
    this.#selection = undefined;
  }

  /** @inheritDoc */
  async getRegionData(options = { execution: null, rollData: {} }) {
    const data = foundry.utils.mergeObject(await super.getRegionData(options), {
      displayMeasurements: false,
      flags: { teriock: { targetRegion: false } },
      highlightMode: "shapes",
      name: _loc("TERIOCK.AUTOMATIONS.Region.DATA.name", {
        name: options.execution?.source.name ?? this.getNearestDocument().name,
      }),
      ...this.data,
    });
    if (this.setTerrain) {
      const { difficultTerrain, removedTerrains, terrains } = this.terrain;
      data.behaviors ??= [];
      data.behaviors.push({
        name: _loc("TYPES.RegionBehavior.terrain"),
        system: { difficultTerrain, removedTerrains: Array.from(removedTerrains), terrains: Array.from(terrains) },
        type: "terrain",
      });
    }
    return data;
  }

  /** @inheritDoc */
  async interactOnExecutionInput(execution) {
    const selection = this.interactInExecution && this.hasSelection
      ? await this._getSelection({ relativeTo: execution.actor })
      : undefined;
    if (selection === false) { return false; }
    this.#selection = selection;
  }
}
