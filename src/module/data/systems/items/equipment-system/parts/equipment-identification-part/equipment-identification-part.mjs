import { makeIcon } from "../../../../../../helpers/utils.mjs";
import { IdentificationModel } from "../../../../../models/_module.mjs";

const { EmbeddedDataField } = foundry.data.fields;

/**
 * Equipment data model mixin that handles identifying and reading magic.
 * @param {typeof EquipmentSystem} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {EquipmentSystem}
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
            name: game.i18n.localize("TERIOCK.SYSTEMS.Equipment.MENU.identify"),
            icon: makeIcon(
              TERIOCK.display.icons.equipment.identify,
              "contextMenu",
            ),
            callback: this.identification.identify.bind(this.identification),
            condition: !this.identification.identified,
            group: "usage",
          },
          {
            name: game.i18n.localize(
              "TERIOCK.SYSTEMS.Equipment.MENU.readMagic",
            ),
            icon: makeIcon(
              TERIOCK.display.icons.equipment.readMagic,
              "contextMenu",
            ),
            callback: this.identification.readMagic.bind(this.identification),
            condition:
              this.parent.isOwner &&
              !this.identification.identified &&
              !this.identification.read,
            group: "usage",
          },
          {
            name: game.i18n.localize(
              "TERIOCK.SYSTEMS.Equipment.MENU.unidentify",
            ),
            icon: makeIcon(
              TERIOCK.display.icons.equipment.unidentify,
              "contextMenu",
            ),
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
          identified: Number(this.identification.identified),
          read: Number(this.identification.read),
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
