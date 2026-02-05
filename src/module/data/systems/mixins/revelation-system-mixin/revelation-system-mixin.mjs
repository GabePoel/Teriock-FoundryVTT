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
      static get metadata() {
        return foundry.utils.mergeObject(super.metadata, {
          revealable: true,
        });
      }

      /** @inheritDoc */
      static defineSchema() {
        const schema = super.defineSchema();
        Object.assign(schema, {
          revealed: new fields.BooleanField({
            hint: "Whether this has been revealed from an identify or other.",
            initial: true,
            label: "Revealed",
            nullable: false,
            required: false,
          }),
        });
        return schema;
      }

      /** @inheritDoc */
      getCardContextMenuEntries(doc) {
        return [
          ...super.getCardContextMenuEntries(doc),
          {
            name: "Reveal",
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
            name: "Unreveal",
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
