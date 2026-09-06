import { makeIcon } from "../../../../helpers/icon.mjs";

const { fields } = foundry.data;

/**
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, RevelationSystem & Teriock.Models.RevelationSystemData>}
 */
export default function RevelationSystemMixin(Base) {
  /**
   * @implements {Teriock.Models.RevelationSystemData}
   * @mixin
   */
  class RevelationSystem extends Base {
    /** @inheritDoc */
    static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Revelation"];

    /** @inheritDoc */
    static get metadata() {
      return foundry.utils.mergeObject(super.metadata, { tags: { revealable: true } });
    }

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        revealed: new fields.BooleanField({ initial: true, nullable: false, required: true }),
      });
    }

    /** @inheritDoc */
    get _nameTags() {
      const tags = super._nameTags;
      if (!this.revealed) { tags.unshift(_loc("TERIOCK.SYSTEMS.Revelation.NAME.unrevealed")); }
      return tags;
    }

    /** @inheritDoc */
    getEmbedContextMenuEntries(doc) {
      return [...super.getEmbedContextMenuEntries(doc), {
        group: "reveal",
        icon: makeIcon(TERIOCK.display.icons.manifest.ui.show, "contextMenu"),
        label: _loc("TERIOCK.SYSTEMS.Revelation.MENU.reveal"),
        visible: !this.revealed && game.user.isGM && doc?.sheet?.isEditable,
        onClick: async () => this.parent.update({ "system.revealed": true }),
      }, {
        group: "reveal",
        icon: makeIcon(TERIOCK.display.icons.manifest.ui.hide, "contextMenu"),
        label: _loc("TERIOCK.SYSTEMS.Revelation.MENU.unreveal"),
        visible: this.revealed && game.user.isGM && doc?.sheet?.isEditable,
        onClick: async () => this.parent.update({ "system.revealed": false }),
      }];
    }

    /** @inheritDoc */
    getLocalRollData() {
      return Object.assign(super.getLocalRollData(), { revealed: Number(this.revealed) });
    }

    /** @inheritDoc */
    prepareDerivedData() {
      super.prepareDerivedData();
      if (this.parent.elder && this.parent.elder?.metadata?.tags?.revealable) {
        this.revealed &&= this.parent.elder?.system.revealed;
      }
    }
  }

  return RevelationSystem;
}
