import { makeIcon } from "../../../helpers/utils.mjs";

const { fields } = foundry.data;

export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @implements {RevelationDataMixinInterface}
     * @extends {ChildTypeModel}
     */
    class RevelationDataMixin extends Base {
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
    }
  );
};
