const { fields } = foundry.data;
import TeriockBaseEffectData from "../base-data/base-data.mjs";

/**
 * @extends {TeriockBaseEffectData}
 */
export default class TeriockAttunementData extends TeriockBaseEffectData {
  /** @inheritdoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      type: "attunement",
    });
  }

  /** @override */
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
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
    };
  }

  /** @override */
  prepareDerivedData() {
    super.prepareDerivedData();
    if (this.inheritTier && this.targetDocument) {
      this.tier = this.parent.getActor().items.get(this.target)?.system.tier.derived;
    }
  }

  /** @override */
  get targetDocument() {
    return this.parent.getActor().items.get(this.target);
  }

  /** @override */
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
}
