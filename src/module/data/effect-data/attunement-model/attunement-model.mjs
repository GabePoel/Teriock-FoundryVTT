import { attunementOptions } from "../../../constants/options/attunement-options.mjs";
import { dotJoin } from "../../../helpers/string.mjs";
import { makeIcon } from "../../../helpers/utils.mjs";
import TeriockBaseEffectModel from "../base-effect-model/base-effect-model.mjs";

const { fields } = foundry.data;

/**
 * Attunement-specific effect data model.
 *
 * Relevant wiki pages:
 * - [Presence](https://wiki.teriock.com/index.php/Core:Presence)
 */
export default class TeriockAttunementModel extends TeriockBaseEffectModel {
  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      type: "attunement",
    });
  }

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
  getCardContextMenuEntries(doc) {
    const entries = super
      .getCardContextMenuEntries(doc)
      .filter((e) => !["Delete", "Duplicate"].includes(e.name));
    return [
      ...entries,
      {
        name: "Deattune",
        icon: makeIcon("handshake-simple-slash", "contextMenu"),
        callback: async () => await this.deattune(),
        group: "attunement",
      },
    ];
  }

  /** @inheritDoc */
  get embedIcons() {
    return [
      {
        icon: "handshake-simple-slash",
        action: "deattuneDoc",
        tooltip: "Deattune",
        condition: this.parent.isOwner,
        callback: async () => await this.deattune(),
      },
      ...super.embedIcons,
    ];
  }

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    parts.subtitle = `Tier ${this.tier || 0}`;
    parts.text = dotJoin([this.type, this.usage]);
    return parts;
  }

  /** @inheritDoc */
  get messageBlocks() {
    return [];
  }

  /** @inheritDoc */
  get messageParts() {
    const parts = super.messageParts;
    parts.bars = [
      {
        icon: "fa-weight-hanging",
        label: "Tier",
        wrappers: [`Tier ${this.tier}`],
      },
    ];
    if (this.targetDocument) {
      parts.associations = [
        {
          title: "Attunement For",
          icon: TERIOCK.options.document.attunement.icon,
          cards: [
            {
              name: this.targetDocument.nameString,
              uuid: this.targetDocument.uuid,
              makeTooltip: true,
              img: this.targetDocument.img,
              color: this.targetDocument.system.color,
              type: this.targetDocument.type,
            },
          ],
        },
      ];
    }
    return parts;
  }

  /**
   * Gets the target document for this attunement.
   * @returns {TeriockEquipment|TeriockMount|null} The target document or null if not found.
   */
  get targetDocument() {
    return this.actor?.items.get(this.target);
  }

  /**
   * Gets the usage status of the attunement target.
   * @returns {string} The usage status.
   */
  get usage() {
    if (this.targetDocument) {
      if (this.targetDocument.type === "equipment") {
        if (this.targetDocument.system.equipped) {
          return "Equipped";
        } else {
          return "Unequipped";
        }
      } else if (this.targetDocument.type === "mount") {
        if (this.targetDocument.system.mounted) {
          return "Mounted";
        } else {
          return "Unmounted";
        }
      } else {
        return "Attuned";
      }
    } else {
      return "Not on Character";
    }
  }

  /**
   * Removes attunement.
   * @returns {Promise<void>}
   */
  async deattune() {
    await this.parent.delete();
  }

  /** @inheritDoc */
  prepareDerivedData() {
    if (this.inheritTier && this.targetDocument) {
      this.tier = this.targetDocument.system.tier.currentValue;
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
