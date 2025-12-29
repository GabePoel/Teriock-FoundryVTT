import { makeIcon } from "../../../helpers/utils.mjs";

const { fields } = foundry.data;

/**
 * @param {typeof TeriockBaseEffectModel} Base
 */
export default function RevelationDataMixin(Base) {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {TeriockBaseEffectModel}
     * @implements {Teriock.Models.RevelationDataMixinInterface}
     * @mixin
     */
    class RevelationData extends Base {
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
            icon: makeIcon("fa-eye", "contextMenu"),
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
            icon: makeIcon("fa-eye-slash", "contextMenu"),
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
          revealed: this.revealed ? 1 : 0,
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
