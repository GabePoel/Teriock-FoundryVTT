import { mergeFreeze } from "../../../helpers/utils.mjs";
import {
  deriveModifiableDeterministic,
  modifiableFormula,
  prepareModifiableBase,
} from "../../shared/fields/modifiable.mjs";

const { fields } = foundry.data;
/**
 * Mixin that provides consumable document functionality.
 * Adds quantity management, automatic consumption, and quantity validation capabilities.
 * @param {typeof ChildTypeModel} Base - The base class to mix in with.
 */
export default (Base) => {
  // noinspection JSClosureCompilerSyntax
  return (
    /**
     * @implements {ConsumableDataMixinInterface}
     * @extends {ChildTypeModel}
     */
    class ConsumableDataMixin extends Base {
      /** @inheritDoc */
      static metadata = mergeFreeze(super.metadata, {
        consumable: true,
      });

      /** @inheritDoc */
      static defineSchema() {
        const schema = super.defineSchema();
        Object.assign(schema, {
          consumable: new fields.BooleanField({
            initial: true,
            label: "Consumable",
          }),
          maxQuantity: modifiableFormula(),
          quantity: new fields.NumberField({
            integer: true,
            initial: 1,
            min: 0,
          }),
        });
        return schema;
      }

      /** @inheritDoc */
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
      prepareBaseData() {
        super.prepareBaseData();
        prepareModifiableBase(this.maxQuantity);
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
        deriveModifiableDeterministic(this.maxQuantity, this.actor, {
          blank: Infinity,
          floor: true,
          min: 0,
        });
        if (this.consumable) {
          this.quantity = Math.max(
            Math.min(this.maxQuantity.value, this.quantity),
            0,
          );
        }
      }

      /** @inheritDoc */
      async use(options) {
        await super.use(options);
        if (!this.parent.getFlag("teriock", "dontConsume")) {
          await this.useOne();
        }
        await this.parent.setFlag("teriock", "dontConsume", false);
      }

      /** @inheritDoc */
      async useOne() {
        if (this.consumable) {
          await this.parent.update({
            "system.quantity": Math.max(0, this.quantity - 1),
          });
        }
      }
    }
  );
};
