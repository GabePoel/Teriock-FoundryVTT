import { EvaluationField } from "../../../fields/_module.mjs";

const { fields } = foundry.data;

/**
 * @param {typeof ChildSystem} Base
 */
export default function ConsumableSystemMixin(Base) {
  // noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {ChildSystem}
     * @implements {Teriock.Models.ConsumableSystemInterface}
     * @mixin
     */
    class ConsumableSystem extends Base {
      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = [
        ...super.LOCALIZATION_PREFIXES,
        "TERIOCK.SYSTEMS.Consumable",
      ];

      /** @inheritDoc */
      static get metadata() {
        return foundry.utils.mergeObject(super.metadata, {
          consumable: true,
        });
      }

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          consumable: new fields.BooleanField({
            initial: true,
          }),
          maxQuantity: new EvaluationField({
            blank: Infinity,
            deterministic: true,
            floor: true,
            min: 0,
          }),
          quantity: new fields.NumberField({
            integer: true,
            initial: 1,
            min: 0,
          }),
        });
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

      /** @returns {Teriock.MessageData.MessageBar} */
      get _consumableBar() {
        return {
          icon: TERIOCK.display.icons.ui.quantity,
          label: game.i18n.localize(
            "TERIOCK.SYSTEMS.Consumable.FIELDS.quantity.label",
          ),
          wrappers: [
            game.i18n.format("TERIOCK.SYSTEMS.Consumable.PANELS.remaining", {
              value: this.quantity,
            }),
            this.maxQuantity.value === Infinity
              ? game.i18n.localize("TERIOCK.SYSTEMS.Consumable.PANELS.noMax")
              : game.i18n.format("TERIOCK.SYSTEMS.Consumable.PANELS.max", {
                  value: this.maxQuantity.value,
                }),
          ],
        };
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
          parts.subtitleTooltip = game.i18n.localize(
            "TERIOCK.SYSTEMS.Consumable.EMBED.consumeOne",
          );
          parts.subtitle =
            this.maxQuantity.value === Infinity
              ? game.i18n.format("TERIOCK.SYSTEMS.Consumable.EMBED.remaining", {
                  value: this.quantity,
                })
              : game.i18n.format(
                  "TERIOCK.SYSTEMS.Consumable.EMBED.remainingMax",
                  {
                    value: this.quantity,
                    max: this.maxQuantity.value,
                  },
                );
        }
        return parts;
      }

      /**
       * Adds one unit to the consumable item.
       * Increments the quantity by 1, respecting maximum quantity limits.
       * @returns {Promise<void>}
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
          consumable: Number(this.consumable),
          quantity: this.consumable ? this.quantity : 1,
          "quantity.max": this.consumable ? this.maxQuantity.value : 1,
        };
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
        if (this.consumable) {
          this.maxQuantity.evaluate();
          this.quantity = Math.max(
            Math.min(this.maxQuantity.value, this.quantity),
            0,
          );
        } else {
          this.maxQuantity._value = Infinity;
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
        if (this.consumable) {
          await this.parent.update({
            "system.quantity": Math.max(0, this.quantity - 1),
          });
        }
      }
    }
  );
}
