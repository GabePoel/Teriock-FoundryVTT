import { makeIcon } from "../../../../helpers/utils.mjs";

const { fields } = foundry.data;

/**
 * @param {typeof BaseEffectSystem} Base
 */
export default function RevelationSystemMixin(Base) {
  return (
    /**
     * @extends {BaseEffectSystem}
     * @extends {Teriock.Models.RevelationSystemData}
     * @mixin
     */
    class RevelationSystem extends Base {
      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Revelation"];

      /** @inheritDoc */
      static get metadata() {
        return foundry.utils.mergeObject(super.metadata, {
          revealable: true,
        });
      }

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          revealed: new fields.BooleanField({
            initial: true,
            nullable: false,
            required: false,
          }),
        });
      }

      /** @inheritDoc */
      get _nameTags() {
        const tags = super._nameTags;
        if (!this.revealed) {
          tags.unshift(_loc("TERIOCK.SYSTEMS.Revelation.NAME.unrevealed"));
        }
        return tags;
      }

      /** @inheritDoc */
      getCardContextMenuEntries(doc) {
        return [
          ...super.getCardContextMenuEntries(doc),
          {
            group: "reveal",
            icon: makeIcon(TERIOCK.display.icons.ui.show, "contextMenu"),
            label: _loc("TERIOCK.SYSTEMS.Revelation.MENU.reveal"),
            onClick: async () =>
              this.parent.update({
                "system.revealed": true,
              }),
            visible: !this.revealed && game.user.isGM && doc?.sheet?.isEditable,
          },
          {
            group: "reveal",
            icon: makeIcon(TERIOCK.display.icons.ui.hide, "contextMenu"),
            label: _loc("TERIOCK.SYSTEMS.Revelation.MENU.unreveal"),
            onClick: async () =>
              this.parent.update({
                "system.revealed": false,
              }),
            visible: this.revealed && game.user.isGM && doc?.sheet?.isEditable,
          },
        ];
      }

      /** @inheritDoc */
      getLocalRollData() {
        return {
          ...super.getLocalRollData(),
          revealed: Number(this.revealed),
        };
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
        if (this.parent.elder && this.parent.elder?.metadata?.revealable) {
          this.revealed = this.revealed && this.parent.elder?.system.revealed;
        }
      }
    }
  );
}
