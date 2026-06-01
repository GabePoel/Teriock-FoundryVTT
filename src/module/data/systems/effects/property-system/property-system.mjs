import { BaseDocumentExecution } from "../../../../executions/document-executions/_module.mjs";
import { mixClasses } from "../../../../helpers/construction.mjs";
import { simplifyTags } from "../../../../helpers/panel.mjs";
import { toCamelCase, toKebabCase } from "../../../../helpers/string.mjs";
import { FormulaField, IdentifierField } from "../../../fields/_module.mjs";
import * as automations from "../../../pseudo-documents/automations/_module.mjs";
import { migrateValueTransform } from "../../../shared/migrations/source-migrations.mjs";
import * as systemMixins from "../../mixins/_module.mjs";
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
 * @mixes GrantedSystem
 * @mixes MetaphysicsSystem
 * @mixes RevelationSystem
 * @mixes WikiSystem
 */
export default class PropertySystem
  extends mixClasses(
    CleanedEffectSystem,
    systemMixins.AdjustableSystemMixin,
    systemMixins.ConsumableSystemMixin,
    systemMixins.GrantedSystemMixin,
    systemMixins.MetaphysicsSystemMixin,
    systemMixins.RevelationSystemMixin,
    systemMixins.WikiSystemMixin,
  )
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Property"];

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
      passive: true,
      type: "property",
      usable: true,
      visibleTypes: ["property"],
    });
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      consumable: new fields.BooleanField({ initial: false }),
      damageType: new IdentifierField({ type: "damage" }),
      extraDamage: new FormulaField({ deterministic: false }),
    });
  }

  /** @inheritDoc */
  static migrateData(source, options, state) {
    migrateValueTransform(source, "damageType", toKebabCase);
    return super.migrateData(source, options, state);
  }

  /** @inheritDoc */
  get _displayFields() {
    return [this._displayFieldInstructions, "system.description", ...this.constructor._adjustableTextFields];
  }

  /** @inheritDoc */
  get _displayToggles() {
    return [
      "system.applyIfDampened",
      "system.applyIfDeattuned",
      "system.applyIfShattered",
      "system.applyIfUnequipped",
      "system.consumable",
      ...super._displayToggles,
    ];
  }

  /** @inheritDoc */
  get _panelBars() {
    return [{
      icon: TERIOCK.config.effect.form[this.form].icon,
      label: _loc("TERIOCK.SYSTEMS.BaseEffect.FIELDS.form.label"),
      wrappers: [TERIOCK.config.effect.form[this.form].label, ...simplifyTags(this._metaphysicsTags)],
    }];
  }

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    if (!this.consumable) { parts.subtitle = TERIOCK.config.effect.form[this.form].label; }
    return parts;
  }

  /** @inheritDoc */
  get needsAttunement() {
    return this.form !== "intrinsic" && super.needsAttunement;
  }

  /** @inheritDoc */
  get wikiPage() {
    return `Property:${TERIOCK.index.properties[toCamelCase(this.identifier ?? "")] ?? ""}`;
  }

  /** @inheritDoc */
  async _use(options = {}) {
    await new BaseDocumentExecution(options).execute();
  }

  /** @inheritDoc */
  getLocalRollData() {
    return {
      ...super.getLocalRollData(),
      [`damage.type.${this._source.damageType}`]: 1,
      [`form.${this.form}`]: 1,
      "damage.extra": this.extraDamage,
      "damage.type": this._source.damageType,
      form: this.form,
    };
  }
}
