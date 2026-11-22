import { TeriockTextEditor } from "../../../../applications/ux/_module.mjs";
import { createElement, mergeMetadata, mixClasses } from "../../../../utils/_module.mjs";
import { localSelectionSchema } from "../../../fields/tools/builders.mjs";
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
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Region"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { tags: { interactInExecution: true }, type: "region" });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), localSelectionSchema(), {
      applyDocuments: new fields.BooleanField({ initial: false }),
      behaviors: new fields.ArrayField(new fields.ObjectField()),
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

  /** @inheritDoc */
  get _formPaths() {
    return [
      ...super._formPaths,
      "visibility",
      "deleteOnTurnChange",
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
    return foundry.utils.mergeObject(await super.getRegionData(options), {
      behaviors: foundry.utils.deepClone(this.behaviors),
      displayMeasurements: false,
      flags: { teriock: { targetRegion: false } },
      highlightMode: "shapes",
      name: _loc("TERIOCK.AUTOMATIONS.Region.DATA.name", {
        name: options.execution?.source.name ?? this.getNearestDocument().name,
      }),
      ...this.data,
    });
  }
}
