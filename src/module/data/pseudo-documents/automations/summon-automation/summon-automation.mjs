import { mergeMetadata, mixClasses, objectMap } from "../../../../utils/_module.mjs";
import { TypedIdentifierSetField } from "../../../fields/_module.mjs";
import { SummonActivation } from "../../activations/_module.mjs";
import { OverrideDataPseudoDocumentMixin } from "../../mixins/_module.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";
import { SelectionAutomationMixin, TriggerAutomationMixin } from "../mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @extends {BaseAutomation}
 * @mixes SelectionAutomation
 * @mixes TriggerAutomation
 * @mixes OverrideDataPseudoDocument
 */
export default class SummonAutomation
  extends mixClasses(BaseAutomation, SelectionAutomationMixin, TriggerAutomationMixin, OverrideDataPseudoDocumentMixin)
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Summon"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { tags: { interactInExecution: true }, type: "summon" });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
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
      globalIdentifiers: new TypedIdentifierSetField({ types: Actor.implementation.TYPES.filter(a => a !== "base") }),
    });
  }

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
    const selection = await this._resolveSelection(options);
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
}
