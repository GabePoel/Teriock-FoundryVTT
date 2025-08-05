import TeriockBaseEffectData from "../base-effect-data/base-effect-data.mjs";

const { fields } = foundry.data;

/**
 * Attunement-specific effect data model.
 *
 * Relevant wiki pages:
 * - [Presence](https://wiki.teriock.com/index.php/Core:Presence)
 *
 * @extends {TeriockBaseEffectData}
 */
export default class TeriockAttunementData extends TeriockBaseEffectData {
  /**
   * Metadata for this effect.
   *
   * @type {Readonly<Teriock.EffectDataModelMetadata>}
   */
  static metadata = Object.freeze({
    consumable: false,
    hierarchy: false,
    namespace: "",
    pageNameKey: "name",
    type: "attunement",
    usable: false,
    wiki: false,
  });

  /** @inheritDoc */
  get messageParts() {
    return {
      ...super.messageParts,
      ...(this.targetDocument?.system?.messageParts || {
        bars: [
          {
            icon: "fa-weight-hanging",
            label: "Tier",
            wrappers: [`Tier ${this.tier}`],
          },
        ],
      }),
      name: this.parent.name,
      image: this.parent.img,
    };
  }

  /**
   * Gets the target document for this attunement.
   *
   * @returns {Document|null} The target document or null if not found.
   * @override
   */
  get targetDocument() {
    return this.actor?.items.get(this.target);
  }

  /**
   * Gets the usage status of the attunement target.
   *
   * @returns {string} The usage status ("Equipped", "Unequipped", or "Not on Character").
   * @override
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
   *
   * @returns {object} The schema definition for the ability data.
   * @override
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
   *
   * @override
   */
  prepareDerivedData() {
    if (this.inheritTier && this.targetDocument) {
      this.tier = this.actor.items.get(this.target)?.system.tier.derived;
    }
  }
}
