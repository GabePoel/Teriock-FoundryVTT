import { makeIcon } from "../../../../../../helpers/utils.mjs";
import { IdentificationModel } from "../../../../../models/_module.mjs";

const { EmbeddedDataField } = foundry.data.fields;

/**
 * Equipment data model mixin that handles identifying and reading magic.
 * @param {typeof EquipmentSystem} Base
 */
export default Base => {
  return (
    /**
     * @extends {BaseItemSystem}
     * @extends {Teriock.Models.EquipmentIdentificationPartData}
     * @mixin
     */
    class EquipmentIdentificationPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return { ...super.defineSchema(), identification: new EmbeddedDataField(IdentificationModel) };
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
        return [{
          classes: "faded-display-field",
          path: "system.identification.notes",
          visible: game.user.isGM && !this.identification.identified,
        }, {
          classes: "faded-display-field",
          path: "system.identification.flaws",
          visible: game.user.isGM && !this.identification.identified,
        }, ...super.displayFields];
      }

      /** @inheritDoc */
      get isSecret() {
        return (!this.identification.identified && !game.user.isGM) || super.isSecret;
      }

      /** @inheritdoc */
      getCardContextMenuEntries(doc) {
        return [...super.getCardContextMenuEntries(doc), {
          group: "usage",
          icon: makeIcon(TERIOCK.display.icons.equipment.identify, "contextMenu"),
          label: _loc("TERIOCK.SYSTEMS.Equipment.MENU.identify"),
          onClick: this.identification.identify.bind(this.identification),
          visible: this.parent.isOwner && !this.identification.identified,
        }, {
          group: "usage",
          icon: makeIcon(TERIOCK.display.icons.equipment.readMagic, "contextMenu"),
          label: _loc("TERIOCK.SYSTEMS.Equipment.MENU.readMagic"),
          onClick: this.identification.readMagic.bind(this.identification),
          visible: this.parent.isOwner && !this.identification.identified && !this.identification.read,
        }, {
          group: "usage",
          icon: makeIcon(TERIOCK.display.icons.equipment.unidentify, "contextMenu"),
          label: _loc("TERIOCK.SYSTEMS.Equipment.MENU.unidentify"),
          onClick: this.identification.unidentify.bind(this.identification),
          visible: this.parent.isOwner && this.identification.identified && game.user.isGM,
        }];
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
