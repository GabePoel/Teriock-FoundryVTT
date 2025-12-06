import { IdentificationModel } from "../../../models/_module.mjs";

const { EmbeddedDataField } = foundry.data.fields;

/**
 * Equipment data model mixin that handles identifying and reading magic.
 * @param {typeof TeriockEquipmentModel} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {TeriockEquipmentModel}
     */
    class EquipmentIdentificationPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return {
          ...super.defineSchema(),
          identification: new EmbeddedDataField(IdentificationModel),
        };
      }

      /** @inheritDoc */
      get displayFields() {
        return [
          {
            path: "system.identification.notes",
            visible: game.user.isGM && !this.identification.identified,
            classes: "faded-display-field",
          },
          {
            path: "system.identification.flaws",
            visible: game.user.isGM && !this.identification.identified,
            classes: "faded-display-field",
          },
          ...super.displayFields,
        ];
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
        if (!this.identification.identified) {
          this.parent._stats.compendiumSource = null;
          this.parent._stats.duplicateSource = null;
        }
      }
    }
  );
};
