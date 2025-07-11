const { fields } = foundry.data;
import TeriockBaseEffectData from "../base-effect-data/base-effect-data.mjs";

/**
 * Attunement-specific effect data model.
 * @extends {TeriockBaseEffectData}
 */
export default class TeriockAttunementData extends TeriockBaseEffectData {
  /** @inheritdoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      type: "attunement",
    });
  }

  /**
   * Gets the target document for this attunement.
   * @override
   * @returns {Document|null} The target document or null if not found.
   */
  get targetDocument() {
    return this.actor?.items.get(this.target);
  }

  /**
   * Gets the usage status of the attunement target.
   * @override
   * @returns {string} The usage status ("Equipped", "Unequipped", or "Not on Character").
   */
  get usage() {
    if (this.targetDocument) {
      if (this.targetDocument.system.equipped) {
        return "Equipped";
      } else {
        return "Unequipped";
      }
    } else {
      return "Not on Character";
    }
  }

  /**
   * Defines the schema for the attunement data model.
   * @override
   * @returns {object} The schema definition for the ability data.
   */
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      type: new fields.StringField({
        initial: "equipment",
        label: "Attunement Type",
        hint: "What type of entity this attunement corresponds to.",
        choices: {
          equipment: "Equipment",
          mount: "Mount",
        },
      }),
      target: new fields.DocumentIdField({
        label: "Attunement Target",
        hint: "The entity that this attunement corresponds to.",
        nullable: true,
        initial: null,
      }),
      inheritTier: new fields.BooleanField({
        label: "Inherit Tier",
        hint: "Whether this attunement inherits the tier of the target.",
        initial: true,
      }),
      tier: new fields.NumberField({
        label: "Tier",
        hint: "The tier of this attunement.",
        initial: 0,
      }),
    });
  }

  /**
   * Prepares derived data for the attunement, including tier inheritance.
   * @override
   */
  prepareDerivedData() {
    if (this.inheritTier && this.targetDocument) {
      this.tier = this.actor.items.get(this.target)?.system.tier.derived;
    }
  }
}
