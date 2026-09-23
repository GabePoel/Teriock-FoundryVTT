import { mergeMetadata, mixClasses } from "../../../../helpers/construction.mjs";
import { IdentifierField } from "../../../fields/_module.mjs";
import { rollableFormulaField } from "../../../fields/tools/builders.mjs";
import {
  AdjustableSystemMixin,
  ConsumableSystemMixin,
  GrantedSystemMixin,
  MetaphysicsSystemMixin,
  RevelationSystemMixin,
  WikiSystemMixin,
} from "../../mixins/_module.mjs";
import CleanedEffectSystem from "../cleaned-effect-system.mjs";

const { fields } = foundry.data;

/**
 * Property-specific effect data model.
 *
 * Relevant wiki pages:
 * - [Properties](https://wiki.teriock.com/index.php/Category:Properties)
 *
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
    AdjustableSystemMixin,
    ConsumableSystemMixin,
    GrantedSystemMixin,
    MetaphysicsSystemMixin,
    RevelationSystemMixin,
    WikiSystemMixin,
  )
{
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Property"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    childTypes: ["property"],
    crit: { enabled: true, where: "chatData" },
    tags: { usable: true },
    type: "property",
    visibleTypes: ["property"],
  });

  /** @inheritDoc */
  static get _automationTypes() {
    return [...super._automationTypes, ...this._activationAutomationTypes, ...this._passiveAutomationTypes];
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      consumable: new fields.BooleanField({ initial: false }),
      damageType: new IdentifierField({ suggestions: true, type: "damage" }),
      extraDamage: rollableFormulaField(),
    });
  }

  /** @inheritDoc */
  get _displayFieldsContent() {
    return [...super._displayFieldsContent, ...this.constructor._adjustableTextFields];
  }

  /** @inheritDoc */
  get _displayToggles() {
    return [
      "system.applyIfDampened",
      "system.applyIfDeattuned",
      "system.applyIfDestroyed",
      "system.applyIfShattered",
      "system.applyIfUnequipped",
      "system.consumable",
      ...super._displayToggles,
    ];
  }

  /** @inheritDoc */
  get _panelBars() {
    return [this._metaphysicsBar];
  }

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    if (!this.consumable) { parts.subtitle = _loc(this._kindEntry.label); }
    return parts;
  }

  /** @inheritDoc */
  get needsAttunement() {
    return this.kind !== "intrinsic" && super.needsAttunement;
  }

  /** @inheritDoc */
  getLocalRollData() {
    const data = Object.assign(super.getLocalRollData(), {
      "dmg.extra": this.extraDamage || 0,
      "dmg.type": this._source.damageType || 0,
    });
    if (this._source.damageType) { data[`dmg.type.${this._source.damageType}`] = 1; }
    return data;
  }
}
