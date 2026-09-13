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
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, EquipmentIdentificationPart & Teriock.Models.EquipmentIdentificationPartData>}
 * @see {IdentificationModel}
 */
export default function EquipmentIdentificationPart(Base) {
  /**
   * @implements {Teriock.Models.EquipmentIdentificationPartData}
   * @mixin
   * @property {TeriockItem<"equipment">} parent
   */
  class EquipmentIdentificationPart extends Base {
    /** @inheritDoc */
    static defineSchema() {
      return { ...super.defineSchema(), identification: new EmbeddedDataField(IdentificationModel) };
    }

    /** @inheritDoc */
    get _displayFieldsContent() {
      const fields = [];
      const identifiedFields = ["system.notes", "system.flaws"];
      for (const f of super._displayFieldsContent) {
        if (identifiedFields.includes(f)) {
          fields.push({
            classes: [TERIOCK.display.panels.styles.faded],
            gmOnly: true,
            path: f.replace("system", "system.identification"),
            visible: !this.identification[f.slice("system.")],
          });
        }
        fields.push(f);
      }
      return fields;
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
        icon: makeIcon(TERIOCK.display.icons.manifest.equipment.identify, "contextMenu"),
        label: _loc("TERIOCK.SYSTEMS.Equipment.MENU.identify"),
        onClick: this.identification.identify.bind(this.identification),
        visible: this.parent.isOwner && !this.identification.identified,
      }, {
        group: "usage",
        icon: makeIcon(TERIOCK.display.icons.manifest.equipment.readMagic, "contextMenu"),
        label: _loc("TERIOCK.SYSTEMS.Equipment.MENU.readMagic"),
        onClick: this.identification.readMagic.bind(this.identification),
        visible: this.parent.isOwner && !this.identification.identified && !this.identification.read,
      }, {
        group: "usage",
        icon: makeIcon(TERIOCK.display.icons.manifest.equipment.unidentify, "contextMenu"),
        label: _loc("TERIOCK.SYSTEMS.Equipment.MENU.unidentify"),
        onClick: this.identification.unidentify.bind(this.identification),
        visible: this.parent.isOwner && this.identification.identified && game.user.isGM,
      }];
    }

    /** @inheritDoc */
    getLocalRollData() {
      return Object.assign(super.getLocalRollData(), {
        identified: Number(this.identification.identified),
        read: Number(this.identification.read),
      });
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
