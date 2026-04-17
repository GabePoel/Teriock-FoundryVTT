import { icons } from "../../../../../../constants/display/icons.mjs";
import {
  ensureChildren,
  ensureNoChildren,
} from "../../../../../../helpers/resolve.mjs";
import { makeIcon } from "../../../../../../helpers/utils.mjs";

const { fields } = foundry.data;

/**
 * Equipment data model mixin that handles equipping, gluing, and attunement.
 * @param {typeof EquipmentSystem} Base
 */
export default (Base) => {
  return (
    /**
     * @extends {BaseItemSystem}
     * @extends {Teriock.Models.EquipmentWieldingPartData}
     * @property {ClientDocument} parent
     * @mixin
     */
    class EquipmentWieldingPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          equipped: new fields.BooleanField({ initial: false }),
          glued: new fields.BooleanField({ initial: false }),
          minStr: new fields.NumberField({
            initial: -3,
            integer: true,
            min: -3,
          }),
        });
      }

      /**
       * Checks if equipping is a valid operation.
       * @returns {boolean}
       */
      get canEquip() {
        return (
          ((this.consumable && this.quantity >= 1) || !this.consumable) &&
          this.actor &&
          !this.equipped
        );
      }

      /**
       * Checks if unequipping is a valid operation.
       * @returns {boolean}
       */
      get canUnequip() {
        return (
          ((this.consumable && this.quantity >= 1) || !this.consumable) &&
          this.actor &&
          this.equipped
        );
      }

      /** @inheritDoc */
      get embedIcons() {
        return [
          {
            action: "toggleGluedDoc",
            icon: this.glued ? icons.equipment.glue : icons.equipment.unglue,
            onClick: async () => {
              if (this.glued) await this.unglue();
              else await this.glue();
            },
            tooltip: this.glued
              ? _loc("TERIOCK.SYSTEMS.Equipment.EMBED.glued")
              : _loc("TERIOCK.SYSTEMS.Equipment.EMBED.unglued"),
            visible: this.parent.isOwner,
          },
          ...super.embedIcons.filter(
            (i) => !i.action?.toLowerCase().includes("disabled"),
          ),
          {
            action: "toggleEquippedDoc",
            icon: this.equipped ? icons.ui.enabled : icons.ui.disabled,
            onClick: async () => {
              if (this.equipped) await this.unequip();
              else await this.equip();
            },
            tooltip: this.equipped
              ? _loc("TERIOCK.SYSTEMS.Equipment.EMBED.equipped")
              : _loc("TERIOCK.SYSTEMS.Equipment.EMBED.unequipped"),
            visible: this.parent.isOwner,
          },
        ];
      }

      /** @inheritDoc */
      get embedParts() {
        return Object.assign(super.embedParts, {
          struck: !this.equipped,
        });
      }

      /** @inheritDoc */
      _onCreate(data, options, userId) {
        super._onCreate(data, options, userId);
        this.unglue();
      }

      /**
       * Equip this equipment.
       * @returns {Promise<void>}
       */
      async equip() {
        await this.parent.hookCall("equip", {
          scope: { equipment: this.parent },
        });
        await this.parent.update({ "system.equipped": true });
      }

      /** @inheritdoc */
      getCardContextMenuEntries(doc) {
        return [
          ...super.getCardContextMenuEntries(doc),
          {
            label: _loc("TERIOCK.SYSTEMS.Equipment.MENU.equip"),
            icon: makeIcon(TERIOCK.display.icons.ui.enable, "contextMenu"),
            onClick: this.equip.bind(this),
            visible:
              this.canEquip &&
              this.parent._checkValidEditorDocument(doc, { self: false }),
            group: "control",
          },
          {
            label: _loc("TERIOCK.SYSTEMS.Equipment.MENU.unequip"),
            icon: makeIcon(TERIOCK.display.icons.ui.disable, "contextMenu"),
            onClick: this.unequip.bind(this),
            visible:
              this.canUnequip &&
              this.parent._checkValidEditorDocument(doc, { self: false }),
            group: "control",
          },
          {
            label: _loc("TERIOCK.SYSTEMS.Equipment.MENU.glue"),
            icon: makeIcon(TERIOCK.display.icons.equipment.glue, "contextMenu"),
            onClick: this.glue.bind(this),
            visible:
              !this.glued &&
              this.actor &&
              this.parent._checkValidEditorDocument(doc, { self: false }),
            group: "control",
          },
          {
            label: _loc("TERIOCK.SYSTEMS.Equipment.MENU.unglue"),
            icon: makeIcon(
              TERIOCK.display.icons.equipment.unglue,
              "contextMenu",
            ),
            onClick: this.unglue.bind(this),
            visible:
              this.glued &&
              this.actor &&
              this.parent._checkValidEditorDocument(doc, { self: false }),
            group: "control",
          },
        ];
      }

      /** @inheritDoc */
      getLocalRollData() {
        return Object.assign(super.getLocalRollData(), {
          equipped: Number(this.equipped),
          glued: Number(this.glued),
          minStr: this.minStr,
          str: this.minStr,
        });
      }

      /**
       * Glue this equipment.
       * @returns {Promise<void>}
       */
      async glue() {
        await this.parent.hookCall("glue", {
          scope: { equipment: this.parent },
        });
        await ensureChildren(this.parent, ["property:glued"]);
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
        if (this.consumable && this.quantity === 0) this.equipped = false;
      }

      /**
       * Unequip this equipment.
       * @returns {Promise<void>}
       */
      async unequip() {
        await this.parent.hookCall("unequip", {
          scope: { equipment: this.parent },
        });
        await this.parent.update({ "system.equipped": false });
      }

      /**
       * Unglue this equipment.
       * @returns {Promise<void>}
       */
      async unglue() {
        await this.parent.hookCall("unglue", {
          scope: { equipment: this.parent },
        });
        await ensureNoChildren(this.parent, "property:glued");
        if (this.glued) {
          await this.parent.update({ "system.glued": false });
        }
      }
    }
  );
};
