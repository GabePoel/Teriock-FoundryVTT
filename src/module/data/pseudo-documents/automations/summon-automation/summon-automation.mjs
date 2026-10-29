import { mergeMetadata, mixClasses, objectMap, omit } from "../../../../utils/_module.mjs";
import { SummonActivation } from "../../activations/_module.mjs";
import { OverrideDataPseudoDocumentMixin, SelectionPseudoDocumentMixin } from "../../mixins/_module.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";
import { TriggerAutomationMixin } from "../mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @extends {BaseAutomation}
 * @mixes SelectionPseudoDocument
 * @mixes TriggerAutomation
 * @mixes OverrideDataPseudoDocument
 */
export default class SummonAutomation
  extends mixClasses(
    BaseAutomation,
    SelectionPseudoDocumentMixin,
    TriggerAutomationMixin,
    OverrideDataPseudoDocumentMixin,
  )
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Summon"];

  /** @inheritdoc */
  static metadata = mergeMetadata(super.metadata, { tags: { interactInExecution: true }, type: "summon" });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(
      omit(super.defineSchema(), ["expandFolders", "expandTables", "localIdentifiers", "localQualifier", "localUuids"]),
      {
        addToCombat: new fields.BooleanField(),
        addToGroup: new fields.StringField({
          blank: true,
          initial: null,
          nullable: true,
          choices: () =>
            objectMap(CONFIG.CombatantGroup.dataModels, (_v, k) => CONFIG.CombatantGroup.typeLabels[k], {
              localize: true,
              none: true,
            }),
        }),
      },
    );
  }

  /**
   * The selection made during an execution. `undefined` if none has been made.
   * @type {{ config: object, document: TeriockDocument|null }|null|undefined}
   */
  #selection;

  /** @inheritDoc */
  get _formPaths() {
    return [
      ...this._selectionPaths,
      "hr",
      ...this._triggerDisplayPaths,
      "hr",
      ...this._overrideDataPaths,
      "hr",
      "addToCombat",
      "addToGroup",
    ];
  }

  /** @inheritDoc */
  async _getActivations(options = {}) {
    const selection = this.#selection === undefined
      ? await this._getSelection({ relativeTo: options.execution?.actor ?? options.actor ?? this.actor })
      : this.#selection;
    if (!selection) { return []; }
    const display = {};
    if (selection.document) {
      display.label = _loc("TERIOCK.AUTOMATIONS.Summon.BUTTONS.placeNamed", {
        name: selection.document.name || _loc("TERIOCK.AUTOMATIONS.Summon.BUTTONS.defaultName"),
      });
    }
    return [
      new SummonActivation({
        ...selection.config,
        addToCombat: this.addToCombat,
        addToGroup: this.addToGroup,
        data: this.data,
        display,
      }),
    ];
  }

  /** @inheritDoc */
  _isSelectable(document) {
    return document?.documentName === "Actor";
  }

  /** @inheritDoc */
  async cleanupExecution() {
    this.#selection = undefined;
  }

  /** @inheritDoc */
  async interactOnExecutionInput(execution) {
    const selection = this.interactInExecution ? await this._getSelection({ relativeTo: execution.actor }) : undefined;
    if (selection === false) { return false; }
    this.#selection = selection;
  }
}
