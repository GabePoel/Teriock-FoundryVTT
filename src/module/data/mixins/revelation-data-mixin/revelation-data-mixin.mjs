import { makeIcon, mergeMetadata } from "../../../helpers/utils.mjs";

const { fields } = foundry.data;

/**
 * @param {typeof ChildTypeModel} Base
 * @constructor
 */
export default function RevelationDataMixin(Base) {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @implements {RevelationDataMixinInterface}
     * @mixin
     */
    class RevelationData extends Base {
      /** @inheritDoc */
      static metadata = mergeMetadata(Base.metadata, { revealable: true });

      /** @inheritDoc */
      static defineSchema() {
        const schema = super.defineSchema();
        Object.assign(schema, {
          revealed: new fields.BooleanField({
            gmOnly: true,
            hint: "Whether this has been revealed from an identify or other.",
            initial: true,
            label: "Revealed",
            nullable: false,
            required: false,
          }),
        });
        return schema;
      }

      get cardContextMenuEntries() {
        return [
          ...super.cardContextMenuEntries,
          {
            name: "Reveal",
            icon: makeIcon("fa-eye", "contextMenu"),
            callback: async () =>
              this.parent.update({
                "system.revealed": true,
              }),
            condition: !this.revealed && game.user.isGM,
            group: "reveal",
          },
          {
            name: "Unreveal",
            icon: makeIcon("fa-eye-slash", "contextMenu"),
            callback: async () =>
              this.parent.update({
                "system.revealed": false,
              }),
            condition: this.revealed && game.user.isGM,
            group: "reveal",
          },
        ];
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
        if (this.parent.source && this.parent.source.metadata.revealable) {
          this.revealed = this.revealed && this.parent.source.system.revealed;
        }
      }
    }
  );
}
