import { getProperty } from "../../../../helpers/fetch.mjs";
import { EvaluationField } from "../../../fields/_module.mjs";

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

      /** @inheritDoc */
      prepareSpecialData() {
        super.prepareSpecialData();
        this.minStr.evaluate();
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
