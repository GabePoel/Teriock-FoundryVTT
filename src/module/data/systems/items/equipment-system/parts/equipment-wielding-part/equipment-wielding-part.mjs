import { getProperty } from "../../../../../../helpers/fetch.mjs";
import { makeIcon } from "../../../../../../helpers/utils.mjs";
import { EvaluationField } from "../../../../../fields/_module.mjs";

const { fields } = foundry.data;

/**
 * Equipment data model mixin that handles equipping, gluing, and attunement.
 * @param {typeof EquipmentSystem} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {EquipmentSystem}
     * @implements {EquipmentWieldingPartInterface}
     * @mixin
     */
    class EquipmentWieldingPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          equipped: new fields.BooleanField({ initial: false }),
          glued: new fields.BooleanField({ initial: false }),
          minStr: new EvaluationField({
            deterministic: true,
            initial: -3,
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
          !this.equipped &&
          this.actor.system.attributes.str.score >= this.minStr.currentValue
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
            icon: this.glued ? "link" : "link-slash",
            action: "toggleGluedDoc",
            tooltip: this.glued ? "Glued" : "Unglued",
            condition: this.parent.isOwner,
            callback: async () => {
              if (this.glued) {
                await this.unglue();
              } else {
                await this.glue();
              }
            },
          },
          ...super.embedIcons.filter(
            (i) => !i.action?.toLowerCase().includes("disabled"),
          ),
          {
            icon: this.equipped ? "circle-check" : "circle",
            action: "toggleEquippedDoc",
            tooltip: this.equipped
              ? game.i18n.localize("TERIOCK.SYSTEMS.Equipment.EMBED.equipped")
              : game.i18n.localize(
                  "TERIOCK.SYSTEMS.Equipment.EMBED.unequipped",
                ),
            condition: this.parent.isOwner,
            callback: async () => {
              if (this.equipped) {
                await this.unequip();
              } else {
                await this.equip();
              }
            },
          },
        ];
      }

      /** @inheritDoc */
      get embedParts() {
        const parts = super.embedParts;
        Object.assign(parts, {
          struck: !this.equipped,
          shattered: this.shattered,
        });
        return parts;
      }

      /** @inheritDoc */
      _onCreate(data, options, userId) {
        super._onCreate(data, options, userId);
        this.unglue().then();
      }

      /**
       * Equip this equipment.
       * @returns {Promise<void>}
       */
      async equip() {
        const data = { doc: this.parent };
        await this.parent.hookCall("equipmentEquip", data);
        if (!data.cancel) {
          await this.parent.update({ "system.equipped": true });
        }
      }

      /** @inheritdoc */
      getCardContextMenuEntries(doc) {
        return [
          ...super.getCardContextMenuEntries(doc),
          {
            name: "Equip",
            icon: makeIcon(TERIOCK.display.icons.ui.enable, "contextMenu"),
            callback: this.equip.bind(this),
            condition: this.canEquip,
            group: "control",
          },
          {
            name: "Unequip",
            icon: makeIcon(TERIOCK.display.icons.ui.disable, "contextMenu"),
            callback: this.unequip.bind(this),
            condition: this.parent.isOwner && this.canUnequip,
            group: "control",
          },
          {
            name: "Glue",
            icon: makeIcon(TERIOCK.display.icons.equipment.glue, "contextMenu"),
            callback: this.glue.bind(this),
            condition: this.parent.isOwner && !this.glued,
            group: "control",
          },
          {
            name: "Unglue",
            icon: makeIcon(
              TERIOCK.display.icons.equipment.unglue,
              "contextMenu",
            ),
            callback: this.unglue.bind(this),
            condition: this.parent.isOwner && this.glued,
            group: "control",
          },
        ];
      }

      /** @inheritDoc */
      getLocalRollData() {
        const data = super.getLocalRollData();
        Object.assign(data, {
          equipped: Number(this.equipped),
          glued: Number(this.glued),
          minStr: this.minStr.value,
          str: this.minStr.value,
        });
        return data;
      }

      /**
       * Glue this equipment.
       * @returns {Promise<void>}
       */
      async glue() {
        const data = { doc: this.parent };
        await this.parent.hookCall("equipmentGlue", data);
        if (!data.cancel) {
          const glueProperty = await getProperty("Glued");
          if (!this.glued) {
            await this.parent.createEmbeddedDocuments("ActiveEffect", [
              glueProperty,
            ]);
          }
        }
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
        if (this.consumable && this.quantity === 0) {
          this.equipped = false;
        }
      }

      /** @inheritDoc */
      prepareSpecialData() {
        super.prepareSpecialData();
        this.minStr.evaluate();
      }

      /**
       * Unequip this equipment.
       * @returns {Promise<void>}
       */
      async unequip() {
        const data = { doc: this.parent };
        await this.parent.hookCall("equipmentUnequip", data);
        if (!data.cancel) {
          await this.parent.update({ "system.equipped": false });
        }
      }

      /**
       * Unglue this equipment.
       * @returns {Promise<void>}
       */
      async unglue() {
        const data = { doc: this.parent };
        await this.parent.hookCall("equipmentUnglue", data);
        if (!data.cancel) {
          if (this.glued) {
            const glueProperties = this.parent.properties.filter(
              (p) => p.name === "Glued",
            );
            if (glueProperties.length > 0) {
              await this.parent.deleteEmbeddedDocuments(
                "ActiveEffect",
                glueProperties.map((p) => p.id),
              );
            }
            if (this.glued) {
              await this.parent.update({ "system.glued": false });
            }
          }
        }
      }
    }
  );
};
