import { mergeMetadata, mixClasses } from "../../../../helpers/construction.mjs";
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
      actions: new fields.NumberField({ initial: 3, integer: true, max: 3, min: 0, nullable: false }),
      attackPenalty: new fields.NumberField({ initial: 0, integer: true, max: 0, nullable: false }),
      initiative: new fields.EmbeddedDataField(InitiativeModel),
      reactions: new fields.NumberField({ initial: 1, integer: true, max: 1, min: 0, nullable: false }),
    });
  }

  /** @inheritDoc */
  get actor() {
    return this.parent.actor;
  }

  /**
   * If this has an actor, return its default combatant.
   * @returns {TeriockCombatant|null}
   */
  get defaultCombatant() {
    return this.actor?.defaultCombatant ?? null;
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
}
