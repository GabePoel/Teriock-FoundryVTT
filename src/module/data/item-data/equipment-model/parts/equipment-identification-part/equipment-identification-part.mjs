import { makeIcon } from "../../../../../helpers/utils.mjs";
import { IdentificationModel } from "../../../../models/_module.mjs";

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
     * @implements {EquipmentIdentificationPartInterface}
     * @mixin
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

      /** @inheritdoc */
      getCardContextMenuEntries(doc) {
        return [
          ...super.getCardContextMenuEntries(doc),
          {
            name: "Identify",
            icon: makeIcon("eye", "contextMenu"),
            callback: this.identification.identify.bind(this.identification),
            condition: !this.identification.identified,
            group: "usage",
          },
          {
            name: "Read Magic",
            icon: makeIcon("hand", "contextMenu"),
            callback: this.identification.readMagic.bind(this.identification),
            condition:
              this.parent.isOwner &&
              !this.identification.identified &&
              !this.identification.read,
            group: "usage",
          },
          {
            name: "Unidentify",
            icon: makeIcon("eye-slash", "contextMenu"),
            callback: this.identification.unidentify.bind(this.identification),
            condition:
              this.parent.isOwner &&
              this.identification.identified &&
              game.user.isGM,
            group: "usage",
          },
        ];
      }

      /** @inheritDoc */
      getLocalRollData() {
        return {
          ...super.getLocalRollData(),
          identified: this.identification.identified ? 1 : 0,
          read: this.identification.read ? 1 : 0,
        };
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
