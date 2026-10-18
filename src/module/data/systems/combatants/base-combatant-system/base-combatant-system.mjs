import { mergeMetadata, mixClasses } from "../../../../utils/_module.mjs";
import { InitiativeModel } from "../../../models/modifier-models/_module.mjs";
import { BaseSystemMixin, UncommonSystemMixin } from "../../mixins/_module.mjs";

const { TypeDataModel } = foundry.abstract;
const { fields } = foundry.data;

/**
 * Base Combatant data model.
 * @extends {TypeDataModel}
 * @mixes BaseSystem
 * @mixes UncommonSystem
 */
export default class BaseCombatantSystem extends mixClasses(TypeDataModel, BaseSystemMixin, UncommonSystemMixin) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Combatant"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { documentName: "Combatant", type: "base" });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      actions: new fields.NumberField({
        initial: TERIOCK.CONFIG.combat.maxActions,
        integer: true,
        max: TERIOCK.CONFIG.combat.maxActions,
        min: 0,
        nullable: false,
      }),
      attackPenalty: new fields.NumberField({ initial: 0, integer: true, max: 0, nullable: false }),
      initiative: new fields.EmbeddedDataField(InitiativeModel),
      reactions: new fields.NumberField({
        initial: TERIOCK.CONFIG.combat.maxReactions,
        integer: true,
        max: TERIOCK.CONFIG.combat.maxReactions,
        min: 0,
        nullable: false,
      }),
    });
  }

  /** @inheritDoc */
  get actor() {
    return this.parent.actor;
  }

  /**
   * The default Combatant that this inherits data from in cases of a shared Actor.
   * @returns {TeriockCombatant}
   */
  get defaultCombatant() {
    return (this.actor && this.parent.parent?.getCombatantsByActor(this.actor)[0]) || this.parent;
  }

  /** @inheritDoc */
  _onCreate(data, options, userId) {
    super._onCreate(data, options, userId);
    this.actor?.render();
  }

  /** @inheritDoc */
  _onDelete(options, userId) {
    super._onDelete(options, userId);
    this.actor?.render();
  }

  /** @inheritDoc */
  _onUpdate(changed, options, userId) {
    super._onUpdate(changed, options, userId);
    if ("system" in changed) { this.actor?.render(); }
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    const defaultCombatant = this.defaultCombatant;
    if (defaultCombatant !== this.parent) {
      Object.assign(this, {
        actions: defaultCombatant.system.actions,
        attackPenalty: defaultCombatant.system.attackPenalty,
        reactions: defaultCombatant.system.reactions,
      });
    }
  }
}
