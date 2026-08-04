import { makeIcon } from "../../../../../../helpers/icon.mjs";
import { IdentificationModel } from "../../../../../models/_module.mjs";

const { EmbeddedDataField } = foundry.data.fields;

/**
 * Equipment data model mixin that handles identifying and reading magic.
 *
 * Relevant wiki pages:
 * - [Identify](https://wiki.teriock.com/index.php/Ability:Identify)
 * - [Read Magic](https://wiki.teriock.com/index.php/Ability:Read_Magic)
 *
 * @template {Constructor<BaseItemSystem>} T
 * @param {T} Base
 * @see {IdentificationModel}
 */
export default function EquipmentIdentificationPart(Base) {
  /**
   * @extends {BaseItemSystem}
   * @extends {Teriock.Models.EquipmentIdentificationPartData}
   * @mixin
   * @property {TeriockEquipment} parent
   */
  class EquipmentIdentificationPart extends Base {
    /** @inheritDoc */
    static defineSchema() {
      return { ...super.defineSchema(), identification: new EmbeddedDataField(IdentificationModel) };
    }

    /** @inheritDoc */
    get _displayFields() {
      return [...this._displayFieldsFirst, {
        classes: [TERIOCK.display.panel.classes.faded],
        gmOnly: true,
        path: "system.identification.notes",
        visible: !this.identification.identified,
      }, {
        classes: [TERIOCK.display.panel.classes.faded],
        gmOnly: true,
        path: "system.identification.flaws",
        visible: !this.identification.identified,
      }, ...super._displayFields.filter(f => !this._isFirstDisplayField(f))];
    }

    /**
     * Identification tags.
     * @returns {Teriock.Display.DisplayTag[]}
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
    get isSecret() {
      return (!this.identification.identified && !game.user.isGM) || super.isSecret;
    }

    /** @inheritdoc */
    getEmbedContextMenuEntries(doc) {
      return [...super.getEmbedContextMenuEntries(doc), {
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

  return EquipmentIdentificationPart;
}
