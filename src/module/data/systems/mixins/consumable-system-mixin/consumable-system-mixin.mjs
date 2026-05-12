import { EvaluationField } from "../../../fields/_module.mjs";
import { ChangeQuantityAutomation } from "../../../pseudo-documents/automations/_module.mjs";

const { fields } = foundry.data;

/**
 * @param {typeof ChildSystem} Base
 */
export default function ConsumableSystemMixin(Base) {
  return (
    /**
     * @extends {ChildSystem}
     * @extends {Teriock.Models.ConsumableSystemData}
     * @mixin
     */
    class ConsumableSystem extends Base {
      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = [
        ...super.LOCALIZATION_PREFIXES,
        "TERIOCK.SYSTEMS.Consumable",
      ];

      /** @inheritDoc */
      static PRESERVED_PROPERTIES = [
        "system.consumable",
        "system.maxQuantity",
        "system.quantity",
        ...super.PRESERVED_PROPERTIES,
      ];

      /** @inheritDoc */
      static get _automationTypes() {
        return [...super._automationTypes, ChangeQuantityAutomation];
      }

      /** @inheritDoc */
      static get metadata() {
        return foundry.utils.mergeObject(super.metadata, {
          consumable: true,
        });
      }

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          consumable: new fields.BooleanField({ initial: true }),
          consumptionAmount: new fields.NumberField({
            initial: 1,
            integer: true,
            nullable: false,
            placeholder: "1",
          }),
          maxQuantity: new EvaluationField({
            blank: Infinity,
            deterministic: true,
            floor: true,
            min: 0,
          }),
          quantity: new fields.NumberField({
            initial: 1,
            integer: true,
            min: 0,
            nullable: false,
            placeholder: "0",
          }),
        });
      }

      /** @returns {Teriock.Messages.MessageBar} */
      get _consumableBar() {
        return {
          icon: TERIOCK.display.icons.ui.quantity,
          label: _loc("TERIOCK.SYSTEMS.Consumable.FIELDS.quantity.label"),
          wrappers: [
            _loc("TERIOCK.SYSTEMS.Consumable.EMBED.remaining", {
              value: this.quantity,
            }),
            this.maxQuantity.value === Infinity
              ? _loc("TERIOCK.SYSTEMS.Consumable.PANELS.noMax")
              : _loc("TERIOCK.SYSTEMS.Consumable.PANELS.max", {
                  value: this.maxQuantity.value,
                }),
            _loc("TERIOCK.SYSTEMS.Consumable.EMBED.perUse", {
              value: this.consumptionAmount,
            }),
          ],
        };
      }

      /**
       * If this is suppressed due to being consumed.
       * @returns {boolean}
       */
      get _isSuppressedConsumed() {
        return this.consumable && this.quantity === 0;
      }

      /** @inheritDoc */
      get embedActions() {
        return Object.assign(super.embedActions, {
          useOneDoc: {
            primary: async () => await this.useOne(),
            secondary: async () => await this.gainOne(),
          },
        });
      }

      /** @inheritDoc */
      get embedParts() {
        const parts = super.embedParts;
        if (this.consumable) {
          parts.subtitleAction = "useOneDoc";
          parts.subtitleTooltip = _loc(
            "TERIOCK.SYSTEMS.Consumable.EMBED.consumeOne",
          );
          parts.subtitle =
            this.maxQuantity.value === Infinity
              ? _loc("TERIOCK.SYSTEMS.Consumable.EMBED.remaining", {
                  value: this.quantity,
                })
              : _loc("TERIOCK.SYSTEMS.Consumable.EMBED.remainingMax", {
                  value: this.quantity,
                  max: this.maxQuantity.value,
                });
        }
        return parts;
      }

      /** @inheritDoc */
      get makeSuppressed() {
        return this._isSuppressedConsumed || super.makeSuppressed;
      }

      /**
       * Adds one unit to the consumable item.
       * Increments the quantity by 1, respecting maximum quantity limits.
       * @returns {Promise<void>}
       */
      async gainOne() {
        if (this.consumable) {
          await this.parent.update({
            "system.quantity": Math.clamp(
              this.quantity + 1,
              0,
              this.maxQuantity.value,
            ),
          });
        }
      }

      /** @inheritDoc */
      getLocalRollData() {
        return {
          ...super.getLocalRollData(),
          consumable: Number(this.consumable),
          max: this.consumable ? this.maxQuantity.value : 1,
          quantity: this.consumable ? this.quantity : 1,
          "quantity.max": this.consumable ? this.maxQuantity.value : 1,
        };
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
        if (this.consumable) {
          this.maxQuantity.evaluate();
          this.quantity = Math.clamp(this.quantity, 0, this.maxQuantity.value);
        } else {
          this.maxQuantity._value = Infinity;
          this.quantity = 1;
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
       * @returns {Promise<void>}
       */
      async useOne() {
        if (this.consumable && this.consumptionAmount) {
          await this.parent.update({
            "system.quantity": Math.max(
              0,
              this.quantity - this.consumptionAmount,
            ),
          });
        }
      }
    }
  );
}
