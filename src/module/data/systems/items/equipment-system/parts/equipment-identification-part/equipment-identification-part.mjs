import { makeIcon } from "../../../../../../helpers/utils.mjs";
import { IdentificationModel } from "../../../../../models/_module.mjs";

const { EmbeddedDataField } = foundry.data.fields;

/**
 * Equipment data model mixin that handles identifying and reading magic.
 * @param {typeof EquipmentSystem} Base
 */
export default (Base) => {
  return (
    /**
     * @extends {BaseItemSystem}
     * @extends {Teriock.Models.EquipmentIdentificationPartData}
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

      /**
       * Identification tags.
       * @returns {Teriock.Sheet.DisplayTag[]}
       */
      get _identificationTags() {
        const tags = [];
        if (this.identification.identified) {
          tags.push({
            label: "TERIOCK.MODELS.Identification.FIELDS.identified.label",
            tooltip: "TERIOCK.MODELS.Identification.label",
          });
        } else {
          tags.push({
            label: "TERIOCK.MODELS.Identification.FIELDS.identified.inverse",
            tooltip: "TERIOCK.MODELS.Identification.label",
          });
          if (this.identification.read) {
            tags.push({
              label: "TERIOCK.MODELS.Identification.FIELDS.read.label",
              tooltip: "TERIOCK.MODELS.Identification.label",
            });
          }
        }
        return tags;
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
      get isSecret() {
        return (
          (!this.identification.identified && !game.user.isGM) || super.isSecret
        );
      }

      /** @inheritdoc */
      getCardContextMenuEntries(doc) {
        return [
          ...super.getCardContextMenuEntries(doc),
          {
            name: _loc("TERIOCK.SYSTEMS.Equipment.MENU.identify"),
            icon: makeIcon(
              TERIOCK.display.icons.equipment.identify,
              "contextMenu",
            ),
            callback: this.identification.identify.bind(this.identification),
            condition: this.parent.isOwner && !this.identification.identified,
            group: "usage",
          },
          {
            name: _loc("TERIOCK.SYSTEMS.Equipment.MENU.readMagic"),
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
            name: _loc("TERIOCK.SYSTEMS.Equipment.MENU.unidentify"),
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
