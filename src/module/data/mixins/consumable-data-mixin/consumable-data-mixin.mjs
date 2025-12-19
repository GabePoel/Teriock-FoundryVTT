import { EvaluationField } from "../../fields/_module.mjs";

const { fields } = foundry.data;

/**
 * @param {typeof ChildTypeModel} Base
 */
export default function ConsumableDataMixin(Base) {
  // noinspection JSClosureCompilerSyntax
  return (
    /**
     * @implements {ConsumableDataMixinInterface}
     * @extends {ChildTypeModel}
     * @mixin
     */
    class ConsumableData extends Base {
      /** @inheritDoc */
      static get metadata() {
        return foundry.utils.mergeObject(super.metadata, {
          consumable: true,
        });
      }

      /** @inheritDoc */
      static defineSchema() {
        const schema = super.defineSchema();
        Object.assign(schema, {
          consumable: new fields.BooleanField({
            initial: true,
            label: "Consumable",
          }),
          maxQuantity: new EvaluationField({
            blank: Infinity,
            floor: true,
            min: 0,
          }),
          quantity: new fields.NumberField({
            integer: true,
            initial: 1,
            min: 0,
          }),
        });
        return schema;
      }

      /** @inheritDoc */
      static migrateData(data) {
        if (data.maxQuantity && typeof data.maxQuantity === "number") {
          const rawMaxQuantity = String(data.maxQuantity) || "";
          const derivedMaxQuantity = Number(data.maxQuantity) || 0;
          data.maxQuantity = {
            raw: rawMaxQuantity,
            derived: derivedMaxQuantity,
          };
        }
        super.migrateData(data);
      }

      /** @inheritDoc */
      get embedActions() {
        const embedActions = super.embedActions;
        Object.assign(embedActions, {
          useOneDoc: {
            primary: async () => await this.useOne(),
            secondary: async () => await this.gainOne(),
          },
        });
        return embedActions;
      }

      /** @inheritDoc */
      get embedParts() {
        const parts = super.embedParts;
        if (this.consumable) {
          parts.subtitleAction = "useOneDoc";
          parts.subtitleTooltip = "Consume One";
          parts.subtitle = `${this.quantity} ${
            this.maxQuantity.value && this.maxQuantity.value !== Infinity
              ? `/ ${this.maxQuantity.value}`
              : "remaining"
          }`;
        }
        return parts;
      }

      /**
       * Adds one unit to the consumable item.
       * Increments the quantity by 1, respecting maximum quantity limits.
       * @returns {Promise<void>} Promise that resolves when the gain is complete.
       */
      async gainOne() {
        if (this.consumable) {
          await this.parent.update({
            "system.quantity": Math.max(
              Math.min(this.maxQuantity.value, this.quantity + 1),
              0,
            ),
          });
        }
      }

      /** @inheritDoc */
      getLocalRollData() {
        return {
          ...super.getLocalRollData(),
          consumable: this.consumable ? 1 : 0,
          quantity: this.consumable ? this.quantity : 1,
          "quantity.max": this.consumable ? this.maxQuantity.value : 1,
        };
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
        this.maxQuantity.evaluate();
        if (this.consumable) {
          this.quantity = Math.max(
            Math.min(this.maxQuantity.value, this.quantity),
            0,
          );
        }
      }

      /** @inheritDoc */
      async use(options = {}) {
        await super.use(options);
        if (
          this.parent.isOwner &&
          this.consumable &&
          !this.parent.inCompendium
        ) {
          if (!this.parent.getFlag("teriock", "dontConsume")) {
            await this.useOne();
          }
          await this.parent.setFlag("teriock", "dontConsume", false);
        }
      }

      /**
       * Consumes one unit of the consumable item.
       * Decrements the quantity by 1, ensuring it doesn't go below 0.
       * @returns {Promise<void>} Promise that resolves when consumption is complete.
       */
      async useOne() {
        if (this.consumable) {
          await this.parent.update({
            "system.quantity": Math.max(0, this.quantity - 1),
          });
        }
      }
    }
  );
}
