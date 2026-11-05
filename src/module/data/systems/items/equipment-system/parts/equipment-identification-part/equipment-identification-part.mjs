import { TeriockDialog } from "../../../../../../applications/api/_module.mjs";
import { DocumentSelector } from "../../../../../../applications/dialogs/_module.mjs";
import { TeriockTextEditor } from "../../../../../../applications/ux/_module.mjs";
import {
  buildWriteOperation,
  fromIdentifier,
  getName,
  makeIcon,
  makeIconClass,
} from "../../../../../../utils/_module.mjs";

const { fields } = foundry.data;

/**
 * Equipment data model mixin that handles identifying and reading magic.
 *
 * Relevant wiki pages:
 * - [Identify](https://wiki.teriock.com/index.php/Ability:Identify)
 * - [Read Magic](https://wiki.teriock.com/index.php/Ability:Read_Magic)
 *
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function EquipmentIdentificationPart(Base) {
  /**
   * @mixin
   * @implements {Teriock.Models.EquipmentIdentificationPartData}
   * @property {TeriockItem<"equipment">} parent
   */
  class EquipmentIdentificationPart
    extends /** @type {InitializedDataModel<T, Teriock.Models.EquipmentIdentificationPartData>} */ (Base)
  {
    /** @inheritDoc */
    static defineSchema() {
      return {
        ...super.defineSchema(),
        identification: new fields.SchemaField({
          identified: new fields.BooleanField({ initial: true }),
          name: new fields.StringField({ gm: true }),
          read: new fields.BooleanField({ initial: true }),
        }),
      };
    }

    /**
     * Identification tags.
     * @returns {Teriock.Display.DisplayTag[]}
     */
    get _identificationTags() {
      const tags = [];
      if (this.identification.identified) {
        tags.push({
          label: "TERIOCK.SYSTEMS.Equipment.FIELDS.identification.identified.label",
          tooltip: "TERIOCK.SYSTEMS.Equipment.FIELDS.identification.label",
        });
      } else {
        tags.push({
          label: "TERIOCK.SYSTEMS.Equipment.FIELDS.identification.identified.inverse",
          tooltip: "TERIOCK.SYSTEMS.Equipment.FIELDS.identification.label",
        });
        if (this.identification.read) {
          tags.push({
            label: "TERIOCK.SYSTEMS.Equipment.FIELDS.identification.read.label",
            tooltip: "TERIOCK.SYSTEMS.Equipment.FIELDS.identification.label",
          });
        }
      }
      return tags;
    }

    /** @inheritDoc */
    get _refreshRecursively() {
      return this.identification.identified && super._refreshRecursively;
    }

    /** @inheritDoc */
    get hasSecrets() {
      return !this.identification.identified || super.hasSecrets;
    }

    /**
     * Whether this equipment's tier is secret. Attunement reveals the tier.
     * @returns {boolean}
     */
    get isTierSecret() {
      return this.parent.isSecret && !this.isAttuned;
    }

    /** @inheritDoc */
    async attune() {
      // Unidentified equipment needs GM approval before it can be attuned
      if (this.parent.isSecret && !this.attunement) {
        const format = { name: this.parent.fullName };
        if (game.users.activeGM) {
          ui.notifications.info("TERIOCK.SYSTEMS.Equipment.QUERY.Attune.ask", { format, localize: true });
        }
        const content = await TeriockTextEditor.enrichHTML(
          _loc("TERIOCK.SYSTEMS.Equipment.QUERY.Attune.question", {
            item: `@UUID[${this.parent.uuid}]{${this.identification.name}}`,
            user: game.user.link,
          }),
        );
        const doAttune = game.user.isGM
          || (game.users.activeGM
            && await TeriockDialog.query(game.users.activeGM, "confirm", {
              content,
              modal: false,
              window: {
                icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.attunable.attune, "title"),
                title: _loc("TERIOCK.SYSTEMS.Equipment.QUERY.Attune.title"),
              },
            }));
        if (!doAttune) {
          ui.notifications.error("TERIOCK.SYSTEMS.Equipment.QUERY.Attune.failure", { format, localize: true });
          return null;
        }
      }
      return super.attune();
    }

    /** @inheritDoc */
    getEmbedContextMenuEntries(doc) {
      return [...super.getEmbedContextMenuEntries(doc), {
        group: "usage",
        icon: makeIcon(TERIOCK.DISPLAY.icons.manifest.equipment.identify, "contextMenu"),
        label: _loc("TERIOCK.SYSTEMS.Equipment.MENU.identify"),
        onClick: this.identify.bind(this),
        visible: this.parent.isEditable && !this.identification.identified,
      }, {
        group: "usage",
        icon: makeIcon(TERIOCK.DISPLAY.icons.manifest.equipment.readMagic, "contextMenu"),
        label: _loc("TERIOCK.SYSTEMS.Equipment.MENU.readMagic"),
        onClick: this.readMagic.bind(this),
        visible: this.parent.isEditable && !this.identification.identified && !this.identification.read,
      }, {
        group: "usage",
        icon: makeIcon(TERIOCK.DISPLAY.icons.manifest.equipment.unidentify, "contextMenu"),
        label: _loc("TERIOCK.SYSTEMS.Equipment.MENU.unidentify"),
        onClick: this.unidentify.bind(this),
        visible: this.parent.isEditable && this.identification.identified && game.user.isGM,
      }];
    }

    /** @inheritDoc */
    getLocalRollData() {
      return Object.assign(super.getLocalRollData(), {
        identified: Number(this.identification.identified),
        read: Number(this.identification.read),
      });
    }

    /**
     * Identifies the equipment.
     *
     * Relevant wiki pages:
     * - [Identify](https://wiki.teriock.com/index.php/Ability:Identify)
     *
     * @returns {Promise<void>}
     */
    async identify() {
      await this.parent.fireTrigger("identify");
      if (!this.identification.identified && game.users.activeGM) {
        ui.notifications.info("TERIOCK.SYSTEMS.Equipment.QUERY.Identify.ask", {
          format: { name: this.parent.fullName },
          localize: true,
        });
        const doIdentify = await game.users.queryGM("teriock.identifyItem", {
          itemUuid: this.parent.uuid,
          userUuid: game.user.uuid,
        }, { failPrefix: "TERIOCK.SYSTEMS.Equipment.QUERY.Identify.failPrefix", localize: true });
        if (doIdentify) {
          ui.notifications.success("TERIOCK.SYSTEMS.Equipment.QUERY.Identify.success", {
            format: { name: this.parent.fullName },
            localize: true,
          });
          return;
        }
      }
      ui.notifications.error("TERIOCK.SYSTEMS.Equipment.QUERY.Identify.failure", {
        format: { name: this.parent.fullName },
        localize: true,
      });
    }

    /** @inheritDoc */
    prepareBaseData() {
      if (!this.identification.read) { this.kind = "unknown"; }
      super.prepareBaseData();
    }

    /**
     * Reads magic on the equipment.
     *
     * Relevant wiki pages:
     * - [Read Magic](https://wiki.teriock.com/index.php/Ability:Read_Magic)
     * - [Magic](https://wiki.teriock.com/index.php/Property:Magic)
     *
     * @returns {Promise<void>}
     */
    async readMagic() {
      await this.parent.fireTrigger("readMagic");
      if (!this.identification.identified && !this.identification.read) {
        if (game.users.activeGM) {
          ui.notifications.info("TERIOCK.SYSTEMS.Equipment.QUERY.ReadMagic.ask", {
            format: { name: this.parent.fullName },
            localize: true,
          });
        }
        const content = await TeriockTextEditor.enrichHTML(
          _loc("TERIOCK.SYSTEMS.Equipment.QUERY.ReadMagic.question", {
            item: `@UUID[${this.parent.uuid}]{${this.identification.name}}`,
            user: game.user.link,
          }),
        );
        const doReadMagic = game.user.isGM
          || (game.users.activeGM
            && await TeriockDialog.query(game.users.activeGM, "confirm", {
              content,
              modal: false,
              window: {
                icon: makeIconClass(TERIOCK.DISPLAY.icons.manifest.equipment.readMagic, "title"),
                title: _loc("TERIOCK.SYSTEMS.Equipment.QUERY.ReadMagic.title"),
              },
            }));
        if (doReadMagic) {
          await this.parent.update({ "system.identification.read": true }, { asGM: true });
          ui.notifications.success("TERIOCK.SYSTEMS.Equipment.QUERY.ReadMagic.success", {
            format: { name: this.parent.fullName },
            localize: true,
          });
        } else {
          ui.notifications.error("TERIOCK.SYSTEMS.Equipment.QUERY.ReadMagic.failure", {
            format: { name: this.parent.fullName },
            localize: true,
          });
        }
      }
    }

    /**
     * Removes identification from the equipment.
     *
     * Relevant wiki pages:
     * - [Identify](https://wiki.teriock.com/index.php/Ability:Identify)
     *
     * @returns {Promise<void>}
     */
    async unidentify() {
      if (this.identification.identified && game.user.isGM) {
        const uncheckedPropertyIdentifiers = [...TERIOCK.CONFIG.equipment.unidentifiedProperties];
        const reference = await fromIdentifier(this.equipmentType);
        if (reference) {
          uncheckedPropertyIdentifiers.push(...reference.previewedTypes.property.map(p => p.system.identifier));
        }
        const revealed = [
          ...this.parent.children.documentsByType.property.filter(p => p.system.revealed),
          ...this.parent.children.documentsByType.ability.filter(a => a.system.revealed),
          ...this.parent.children.documentsByType.resource.filter(r => r.system.revealed),
          ...this.parent.children.documentsByType.fluency.filter(f => f.system.revealed),
        ];
        const checked = revealed.filter(e =>
          e.type !== "property" || !uncheckedPropertyIdentifiers.includes(e.system.identifier)
        ).map(e => e.uuid);
        const toReveal = await DocumentSelector.selectMulti(revealed, {
          checked,
          hint: _loc("TERIOCK.SYSTEMS.Equipment.QUERY.Unidentify.hint"),
          noDocumentsMessage: _loc("TERIOCK.SYSTEMS.Equipment.QUERY.Unidentify.noDocumentsMessage"),
          silent: true,
        });
        if (!toReveal) { return; }
        const revealOperation = this.parent.getUpdateChildDocumentsOperation(
          "ActiveEffect",
          toReveal.map(e => {
            return { _id: e._id, "system.revealed": false };
          }),
        );
        const itemOperation = await buildWriteOperation({
          action: "update",
          docData: {
            name: _loc("TERIOCK.SYSTEMS.Equipment.QUERY.Unidentify.name", { type: getName(this.equipmentType) }),
            "system.identification.identified": false,
            "system.identification.name": this.parent._source.name,
            "system.identification.read": false,
          },
          uuid: this.parent.uuid,
        });
        await foundry.documents.modifyBatch([revealOperation, itemOperation].filter(Boolean));
      } else {
        ui.notifications.warn("TERIOCK.SYSTEMS.Equipment.QUERY.Unidentify.alreadyUnidentified", { localize: true });
      }
    }
  }

  return EquipmentIdentificationPart;
}
