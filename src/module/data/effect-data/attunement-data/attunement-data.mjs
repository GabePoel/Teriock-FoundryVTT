import { attunementOptions } from "../../../constants/options/attunement-options.mjs";
import { documentOptions } from "../../../constants/options/document-options.mjs";
import { evaluateSync, mergeFreeze } from "../../../helpers/utils.mjs";
import TeriockBaseEffectModel from "../base-effect-data/base-effect-data.mjs";

const { fields } = foundry.data;

/**
 * Attunement-specific effect data model.
 *
 * Relevant wiki pages:
 * - [Presence](https://wiki.teriock.com/index.php/Core:Presence)
 */
export default class TeriockAttunementModel extends TeriockBaseEffectModel {
  /**
   * @inheritDoc
   * @type {Readonly<Teriock.Documents.EffectModelMetadata>}
   */
  static metadata = mergeFreeze(super.metadata, {
    type: "attunement",
  });

  /** @inheritDoc */
  static defineSchema() {
    return foundry.utils.mergeObject(super.defineSchema(), {
      type: new fields.StringField({
        initial: "equipment",
        label: "Attunement Type",
        hint: "What type of entity this attunement corresponds to.",
        choices: attunementOptions.attunementType,
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
      icon: documentOptions.attunement.icon,
      label: documentOptions.attunement.name,
    };
  }

  /**
   * Gets the target document for this attunement.
   * @returns {TeriockEquipment|null} The target document or null if not found.
   */
  get targetDocument() {
    return this.actor?.items.get(this.target);
  }

  /**
   * Gets the usage status of the attunement target.
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

  /** @inheritDoc */
  prepareDerivedData() {
    if (this.inheritTier && this.targetDocument) {
      this.tier = evaluateSync(
        this.targetDocument.system.tier.saved,
        this.actor?.getRollData() || {},
      );
    }
    this.parent.changes = [
      {
        key: "system.attunements",
        mode: 2,
        value: this.target,
        priority: 10,
      },
      {
        key: "system.presence.value",
        mode: 2,
        value: this.tier,
        priority: 10,
      },
    ];
  }
}
