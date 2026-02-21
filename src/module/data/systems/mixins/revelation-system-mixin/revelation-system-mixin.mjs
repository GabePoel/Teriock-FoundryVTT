import { makeIcon } from "../../../../helpers/utils.mjs";

const { fields } = foundry.data;

/**
 * @param {typeof BaseEffectSystem} Base
 */
export default function RevelationSystemMixin(Base) {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {BaseEffectSystem}
     * @implements {Teriock.Models.RevelationSystemInterface}
     * @mixin
     */
    class RevelationSystem extends Base {
      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = [
        ...super.LOCALIZATION_PREFIXES,
        "TERIOCK.SYSTEMS.Revelation",
      ];

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
      getCardContextMenuEntries(doc) {
        return [
          ...super.getCardContextMenuEntries(doc),
          {
            name: game.i18n.localize("TERIOCK.SYSTEMS.Revelation.MENU.reveal"),
            icon: makeIcon(TERIOCK.display.icons.ui.show, "contextMenu"),
            callback: async () =>
              this.parent.update({
                "system.revealed": true,
              }),
            condition:
              !this.revealed && game.user.isGM && doc?.sheet?.isEditable,
            group: "reveal",
          },
          {
            name: game.i18n.localize(
              "TERIOCK.SYSTEMS.Revelation.MENU.unreveal",
            ),
            icon: makeIcon(TERIOCK.display.icons.ui.hide, "contextMenu"),
            callback: async () =>
              this.parent.update({
                "system.revealed": false,
              }),
            condition:
              this.revealed && game.user.isGM && doc?.sheet?.isEditable,
            group: "reveal",
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
        if (this.parent.elder && this.parent.elder?.metadata.revealable) {
          this.revealed = this.revealed && this.parent.elder?.system.revealed;
        }
      }
    }
  );
}
