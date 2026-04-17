import { BaseDocumentExecution } from "../../../../executions/document-executions/_module.mjs";
import { mix } from "../../../../helpers/construction.mjs";
import { simplifyTags } from "../../../../helpers/panel.mjs";
import { toKebabCase } from "../../../../helpers/string.mjs";
import { FormulaField, IdentifierField } from "../../../fields/_module.mjs";
import * as automations from "../../../pseudo-documents/automations/_module.mjs";
import * as mixins from "../../mixins/_module.mjs";
import CleanedEffectSystem from "../cleaned-effect-system.mjs";

const { fields } = foundry.data;

/**
 * Property-specific effect data model.
 *
 * Relevant wiki pages:
 * - [Properties](https://wiki.teriock.com/index.php/Category:Properties)
 *
 * @extends {CleanedEffectSystem}
 * @extends {Teriock.Models.PropertySystemData}
 * @mixes AdjustableSystem
 * @mixes ConsumableSystem
 * @mixes RevelationSystem
 * @mixes WikiSystem
 */
export default class PropertySystem extends mix(
  CleanedEffectSystem,
  mixins.AdjustableSystemMixin,
  mixins.ConsumableSystemMixin,
  mixins.WikiSystemMixin,
  mixins.RevelationSystemMixin,
) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.SYSTEMS.Property",
  ];

  /** @inheritDoc */
  static get _automationTypes() {
    return [
      ...super._automationTypes,
      automations.ChangesAutomation,
      automations.TradecraftAutomation,
      automations.CommonOutcomesAutomation,
      automations.HacksAutomation,
      automations.PropertyMacroAutomation,
      automations.RollAutomation,
      automations.TakeAutomation,
      automations.UseDocumentsAutomation,
    ];
  }

  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      childEffectTypes: ["property"],
      indexCategoryKey: "properties",
      indexCompendiumKey: "properties",
      modifies: "Item",
      namespace: "Property",
      passive: true,
      type: "property",
      usable: true,
      visibleTypes: ["property"],
    });
  }

  /** @inheritDoc */
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      applyIfDampened: new fields.BooleanField({ initial: false }),
      applyIfShattered: new fields.BooleanField({ initial: false }),
      applyIfUnequipped: new fields.BooleanField({ initial: true }),
      consumable: new fields.BooleanField({ initial: false }),
      damageType: new IdentifierField({ initial: "" }),
      extraDamage: new FormulaField({ deterministic: false }),
    });
  }

  /** @inheritDoc */
  static migrateData(data) {
    if (data.damageType) data.damageType = toKebabCase(data.damageType);
    return super.migrateData(data);
  }

  /** @inheritDoc */
  get _isSuppressedDampened() {
    return !this.applyIfDampened && super._isSuppressedDampened;
  }

  /** @inheritDoc */
  get _isSuppressedShattered() {
    return !this.applyIfShattered && super._isSuppressedShattered;
  }

  /** @inheritDoc */
  get _isSuppressedUnequipped() {
    return !this.applyIfUnequipped && super._isSuppressedUnequipped;
  }

  /**
   * Metaphysics tags.
   * @returns {Teriock.Sheet.DisplayTag[]}
   */
  get _metaphysicsTags() {
    const tags = [];
    if (this.mundane) {
      tags.push("TERIOCK.SYSTEMS.Adjustable.FIELDS.mundane.label");
    }
    return tags;
  }

  /** @inheritDoc */
  get color() {
    return TERIOCK.options.effect.form[this.form].color;
  }

  /** @inheritDoc */
  get displayFields() {
    return ["system.description", ...this.constructor._adjustableTextFields];
  }

  /** @inheritDoc */
  get displayTags() {
    return [...super.displayTags, ...this._metaphysicsTags];
  }

  /** @inheritDoc */
  get displayToggles() {
    return [
      "system.applyIfShattered",
      "system.applyIfDampened",
      "system.applyIfUnequipped",
      "system.mundane",
      "system.consumable",
      ...super.displayToggles,
    ];
  }

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    if (!this.consumable) {
      parts.subtitle = TERIOCK.options.effect.form[this.form].label;
    }
    return parts;
  }

  /** @inheritDoc */
  get messageBars() {
    return [
      {
        icon: TERIOCK.options.effect.form[this.form].icon,
        label: _loc("TERIOCK.SYSTEMS.BaseEffect.FIELDS.form.label"),
        wrappers: [
          TERIOCK.options.effect.form[this.form].label,
          ...simplifyTags(this._metaphysicsTags),
        ],
      },
    ];
  }

  /**
   * @inheritDoc
   * @returns {"Actor"|"Item"}
   */
  get modifies() {
    if (this.modifiesActor) return "Actor";
    return super.modifies;
  }

  /** @inheritDoc */
  async _use(options = {}) {
    await new BaseDocumentExecution(options).execute();
  }

  /** @inheritDoc */
  getLocalRollData() {
    return {
      ...super.getLocalRollData(),
      form: this.form,
      [`form.${this.form}`]: 1,
      "damage.type": this.damageType,
      [`damage.type.${this.damageType}`]: 1,
      "damage.extra": this.extraDamage,
    };
  }
}
