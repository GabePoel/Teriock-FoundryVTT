import { getProperty } from "../../../../../helpers/fetch.mjs";
import { makeIcon } from "../../../../../helpers/utils.mjs";
import { EvaluationField } from "../../../../fields/_module.mjs";

const { fields } = foundry.data;

/**
 * Equipment data model mixin that handles equipping, gluing, and attunement.
 * @param {typeof TeriockEquipmentModel} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {TeriockEquipmentModel}
     * @implements {EquipmentWieldingPartInterface}
     * @mixin
     */
    class EquipmentWieldingPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        const schema = super.defineSchema();
        Object.assign(schema, {
          equipped: new fields.BooleanField({
            initial: false,
            label: "Equipped",
          }),
          glued: new fields.BooleanField({
            initial: false,
            label: "Glued",
          }),
          minStr: new EvaluationField({
            min: -3,
            initial: -3,
          }),
        });
        return schema;
      }

      /**
       * Checks if equipping is a valid operation.
       * @returns {boolean}
       */
      get canEquip() {
        return (
          ((this.consumable && this.quantity >= 1) || !this.consumable) &&
          !this.isEquipped &&
          this.actor?.system.attributes.str.score >= this.minStr
        );
      }

      /**
       * Checks if unequipping is a valid operation.
       * @returns {boolean}
       */
      get canUnequip() {
        return (
          ((this.consumable && this.quantity >= 1) || !this.consumable) &&
          this.isEquipped
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
          ...super.embedIcons,
          {
            icon: this.equipped ? "circle-check" : "circle",
            action: "toggleEquippedDoc",
            tooltip: this.equipped ? "Equipped" : "Unequipped",
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
          struck: !this.isEquipped,
          shattered: this.shattered,
        });
        return parts;
      }

      /**
       * Checks if the equipment is currently equipped.
       * @returns {boolean} - True if the equipment is equipped, false otherwise.
       */
      get isEquipped() {
        if (this.consumable) {
          return this.quantity >= 1 && this.equipped;
        } else {
          return this.equipped;
        }
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
            icon: makeIcon("check", "contextMenu"),
            callback: this.equip.bind(this),
            condition: this.canEquip,
            group: "control",
          },
          {
            name: "Unequip",
            icon: makeIcon("xmark", "contextMenu"),
            callback: this.unequip.bind(this),
            condition: this.parent.isOwner && this.canUnequip,
            group: "control",
          },
          {
            name: "Glue",
            icon: makeIcon("link", "contextMenu"),
            callback: this.glue.bind(this),
            condition: this.parent.isOwner && !this.glued,
            group: "control",
          },
          {
            name: "Unglue",
            icon: makeIcon("link-slash", "contextMenu"),
            callback: this.unglue.bind(this),
            condition: this.parent.isOwner && this.glued,
            group: "control",
          },
        ];
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
