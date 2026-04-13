import { attunementOptions } from "../../../../constants/options/attunement-options.mjs";
import { localizeChoices } from "../../../../helpers/localization.mjs";
import { dotJoin, toCamelCase } from "../../../../helpers/string.mjs";
import { makeIcon, objectMap } from "../../../../helpers/utils.mjs";
import BaseEffectSystem from "../base-effect-system/base-effect-system.mjs";

const { fields } = foundry.data;

/**
 * Attunement-specific effect data model.
 *
 * Relevant wiki pages:
 * - [Presence](https://wiki.teriock.com/index.php/Core:Presence)
 *
 * @extends {Teriock.Models.AttunementSystemData}
 */
export default class AttunementSystem extends BaseEffectSystem {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [
    ...super.LOCALIZATION_PREFIXES,
    "TERIOCK.SYSTEMS.Attunement",
  ];

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
        initial: "effect",
        choices: localizeChoices(
          objectMap(attunementOptions.type, (v) => v.label),
        ),
      }),
      target: new fields.DocumentIdField({
        nullable: true,
        initial: null,
      }),
      inheritTier: new fields.BooleanField({ initial: true }),
      tier: new fields.NumberField({
        label: "TERIOCK.SYSTEMS.Attunable.FIELDS.tier.raw.label",
        initial: 0,
      }),
    });
  }

  /** @inheritDoc */
  get color() {
    return this.targetDocument
      ? TERIOCK.display.colors.green
      : TERIOCK.display.colors.orange;
  }

  /** @inheritDoc */
  get embedIcons() {
    return [
      {
        action: "deattuneDoc",
        icon: TERIOCK.display.icons.attunable.deattune,
        onClick: async () => await this.deattune(),
        tooltip: _loc("TERIOCK.SYSTEMS.Attunable.MENU.deattune"),
        visible: this.parent.isOwner,
      },
      ...super.embedIcons,
    ];
  }

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    parts.subtitle = _loc("TERIOCK.SYSTEMS.Attunement.PANELS.subtitle", {
      tier: this.tier || 0,
    });
    parts.text = dotJoin([attunementOptions.type[this.type].label, this.usage]);
    return parts;
  }

  /** @inheritDoc */
  get messageBlocks() {
    return [];
  }

  /** @inheritDoc */
  get panelParts() {
    const parts = super.panelParts;
    parts.bars = [
      {
        icon: TERIOCK.display.icons.attunable.tier,
        label: _loc("TERIOCK.SYSTEMS.Attunable.FIELDS.tier.raw.label"),
        wrappers: [
          attunementOptions.type[this.type].label,
          _loc("TERIOCK.SYSTEMS.Attunable.PANELS.tier", {
            value: this.tier || 0,
          }),
        ],
      },
    ];
    if (this.targetDocument) {
      parts.associations = [
        {
          title: _loc("TERIOCK.SYSTEMS.Attunement.PANELS.for"),
          icon: TERIOCK.options.document.attunement.icon,
          cards: [
            {
              name: this.targetDocument.fullName,
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
          return _loc("TERIOCK.SYSTEMS.Equipment.EMBED.equipped");
        } else {
          return _loc("TERIOCK.SYSTEMS.Equipment.EMBED.unequipped");
        }
      } else if (this.targetDocument.type === "mount") {
        if (this.targetDocument.system.mounted) {
          return _loc("TERIOCK.SYSTEMS.Mount.EMBED.mounted");
        } else {
          return _loc("TERIOCK.SYSTEMS.Mount.EMBED.unmounted");
        }
      } else {
        return _loc("TERIOCK.SYSTEMS.Attunement.USAGE.attuned");
      }
    } else if (this.target) {
      return _loc("TERIOCK.SYSTEMS.Attunement.USAGE.missing");
    } else {
      return "";
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
  getCardContextMenuEntries(doc) {
    const entries = super
      .getCardContextMenuEntries(doc)
      .filter(
        (e) =>
          ![
            _loc("TERIOCK.SYSTEMS.Common.MENU.delete"),
            _loc("TERIOCK.SYSTEMS.Common.MENU.duplicate"),
          ].includes(e.label),
      );
    return [
      ...entries,
      {
        label: _loc("TERIOCK.SYSTEMS.Attunable.MENU.deattune"),
        icon: makeIcon(TERIOCK.display.icons.attunable.deattune, "contextMenu"),
        onClick: async () => await this.deattune(),
        group: "attunement",
      },
    ];
  }

  /** @inheritDoc */
  getLocalRollData() {
    return {
      ...super.getLocalRollData(),
      [`type.${toCamelCase(this.type)}`]: 1,
      tier: this.tier,
      target: this.targetDocument ? 1 : 0,
    };
  }

  /** @inheritDoc */
  prepareDerivedData() {
    if (this.inheritTier && this.targetDocument) {
      this.tier = this.targetDocument.system.tier.currentValue;
    }
    this.parent.changes = [
      {
        key: "system.presence.value",
        mode: 2,
        value: this.tier,
        priority: 10,
      },
    ];
  }
}
