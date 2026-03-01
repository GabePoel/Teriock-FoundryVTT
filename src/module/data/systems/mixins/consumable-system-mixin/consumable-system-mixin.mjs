import { TeriockDialog } from "../../../../applications/api/_module.mjs";
import { TeriockTextEditor } from "../../../../applications/ux/_module.mjs";
import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { TeriockChatMessage } from "../../../../documents/_module.mjs";
import { makeIconClass } from "../../../../helpers/utils.mjs";
import { EvaluationField } from "../../../fields/_module.mjs";
import { RegainUsesAutomation } from "../../../pseudo-documents/automations/_module.mjs";

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
     * @mixes OperationTriggerData
     * @mixin
     */
    class ConsumableSystem extends Base {
      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = [
        ...super.LOCALIZATION_PREFIXES,
        "TERIOCK.SYSTEMS.Consumable",
      ];

      /** @inheritDoc */
      static get _automationTypes() {
        return [...super._automationTypes, RegainUsesAutomation];
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

      /** @inheritDoc */
      _onDawn() {
        super._onDawn();
        this._regainUsesFromTrigger("dawn").then();
      }

      /** @inheritDoc */
      _onDusk() {
        super._onDusk();
        this._regainUsesFromTrigger("dusk").then();
      }

      /** @inheritDoc */
      _onLongRest() {
        super._onLongRest();
        this._regainUsesFromTrigger("longRest").then();
      }

      /** @inheritDoc */
      _onShortRest() {
        super._onShortRest();
        this._regainUsesFromTrigger("shortRest").then();
      }

      /**
       * Regain uses that match a specific trigger defined in automations.
       * @param {Teriock.System.TimeTrigger} trigger
       */
      async _regainUsesFromTrigger(trigger) {
        const candidateAutomations =
          /** @type {RegainUsesAutomation[]} */ this.activeAutomations.filter(
            (a) => a.type === RegainUsesAutomation.TYPE,
          );
        const triggeredAutomations = candidateAutomations.filter(
          (a) => a.trigger === trigger,
        );
        let change = 0;
        for (const a of triggeredAutomations) {
          if (!this.consumable) continue;
          const regain = await TeriockDialog.confirm({
            content: await TeriockTextEditor.enrichHTML(
              "<p>" +
                game.i18n.format(
                  "TERIOCK.AUTOMATIONS.RegainUsesAutomation.DIALOG.text",
                  { name: `@UUID[${this.parent.uuid}]` },
                ) +
                "</p>",
            ),
            window: {
              icon: makeIconClass(
                TERIOCK.options.document[this.parent.type].icon,
                "title",
              ),
              title: game.i18n.localize(
                "TERIOCK.AUTOMATIONS.RegainUsesAutomation.LABEL",
              ),
            },
          });
          if (!regain) continue;
          const roll = new BaseRoll(a.formula, this.getRollData(), {
            flavor: game.i18n.localize(
              "TERIOCK.AUTOMATIONS.RegainUsesAutomation.USAGE.roll",
            ),
          });
          await roll.evaluate();
          /** @type {Teriock.MessageData.MessagePanel} */
          const panelData = {
            bars: [
              {
                label: game.i18n.localize(
                  "TERIOCK.SHEETS.Common.NAVIGATION.enterAutomationsTab",
                ),
                icon: TERIOCK.display.icons.ui.automations,
                wrappers: [
                  game.i18n.localize(
                    "TERIOCK.AUTOMATIONS.BaseAutomation.LABEL",
                  ),
                  TERIOCK.options.time.triggers[trigger],
                ],
              },
            ],
            blocks: [
              {
                text: game.i18n.format(
                  "TERIOCK.AUTOMATIONS.RegainUsesAutomation.USAGE.description",
                  { name: this.parent.nameString },
                ),
                title: game.i18n.localize(
                  "TERIOCK.SYSTEMS.Child.FIELDS.description.label",
                ),
              },
            ],
            icon: TERIOCK.display.icons.ui.automations,
            image: this.parent.img,
            label: game.i18n.localize(
              "TERIOCK.AUTOMATIONS.RegainUsesAutomation.LABEL",
            ),
            name: game.i18n.localize(
              "TERIOCK.AUTOMATIONS.RegainUsesAutomation.LABEL",
            ),
          };
          const panel = await TeriockTextEditor.enrichPanel(panelData);
          const messageData = {
            rolls: [roll],
            speaker: TeriockChatMessage.getSpeaker({ actor: this.actor }),
            system: {
              panels: [panel],
            },
          };
          await TeriockChatMessage.create(messageData);
          change += roll.total;
        }
        if (change !== 0) {
          await this.parent.update({
            "system.quantity": Math.max(
              Math.min(this.maxQuantity.value, this.quantity + change),
              0,
            ),
          });
        }
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
