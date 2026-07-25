import { icons } from "../../../../../../constants/display/icons.mjs";
import { createElement } from "../../../../../../helpers/html.mjs";
import { asInf, makeIconClass } from "../../../../../../helpers/icon.mjs";
import { toKebabCase } from "../../../../../../helpers/string.mjs";
import { consolidateWriteOperations } from "../../../../../../helpers/utils.mjs";
import { DocumentSelector } from "../../../../../dialogs/_module.mjs";

/**
 * @template {Constructor<BaseActorSheet>} T
 * @param {T} Base
 */
export default function PlayableActorSheetMechanicalPart(Base) {
  return (
    /**
     * @extends {BaseActorSheet}
     * @mixin
     */
    class PlayableActorSheetMechanicalPart extends Base {
      /**
       * Pull from the Death Bag.
       * @returns {Promise<void>}
       */
      static async #onDeathBagPull() {
        await this.actor.system.deathBagPull();
      }

      /**
       * Increases cover by a step.
       * @param {PointerEvent} event
       * @returns {Promise<void>}
       */
      static async #onIncreaseCover(event) {
        if (event.button === 0) {
          if (this.document.system.cover < 3) { await this.document.system.increaseCover(); }
          else { await this.document.system.decreaseCover(3); }
        } else if (event.button === 2) {
          if (this.document.system.cover > 0) { await this.document.system.decreaseCover(); }
          else { await this.document.system.increaseCover(3); }
        }
      }

      /**
       * Quickly uses an item with optional modifiers.
       * @param {PointerEvent} event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>}
       */
      static async #onQuickUse(event, target) {
        const id = target.dataset.id;
        const item = this.document.items.get(id);
        if (item) { await item.use({ event }); }
      }

      /**
       * Take a dawn.
       * @returns {Promise<void>}
       */
      static async #onTakeDawn() {
        await this.actor.system.takeDawn();
      }

      /**
       * Take a dusk.
       * @returns {Promise<void>}
       */
      static async #onTakeDusk() {
        await this.actor.system.takeDusk();
      }

      /**
       * Take a long rest.
       * @returns {Promise<void>}
       */
      static async #onTakeLongRest() {
        await this.actor.system.takeLongRest();
      }

      /**
       * Take a short rest.
       * @returns {Promise<void>}
       */
      static async #onTakeShortRest() {
        await this.actor.system.takeShortRest();
      }

      /**
       * Toggles a condition.
       * @param {PointerEvent} event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>}
       */
      static async #onToggleCondition(event, target) {
        if (event.button === 0) { await this.document.toggleStatusEffect(target.dataset.condition); }
        if (event.button === 2) {
          const document = await teriock.fromIdentifier(`condition:${toKebabCase(target.dataset.condition)}`);
          await document?.sheet.render(true);
        }
      }

      /**
       * Toggle Documents to be enabled or disabled.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>}
       */
      static async #onToggleDocs(_event, target) {
        const docs = foundry.utils.getProperty(this.document, target.dataset.path) ?? [];
        const enabled = await DocumentSelector.selectMulti(docs, {
          checked: docs.filter(d => !d.disabled).map(r => r.uuid),
        });
        const freeOps = docs.map(d => {
          return {
            action: "update",
            documentName: d.documentName,
            pack: d.pack,
            parent: d.parent,
            updates: [{
              _id: d.id,
              [d.documentName === "Item" ? "system.disabled" : "disabled"]: !enabled.includes(d),
            }],
          };
        });
        await foundry.documents.modifyBatch(consolidateWriteOperations(freeOps));
      }

      /** @type {Partial<ApplicationConfiguration & Teriock.Sheet._SheetConfiguration>} */
      static DEFAULT_OPTIONS = {
        actions: {
          deathBagPull: this.#onDeathBagPull,
          increaseCover: { buttons: [0, 2], handler: this.#onIncreaseCover },
          quickUse: { buttons: [0, 2], handler: this.#onQuickUse },
          takeDawn: this.#onTakeDawn,
          takeDusk: this.#onTakeDusk,
          takeLongRest: this.#onTakeLongRest,
          takeShortRest: this.#onTakeShortRest,
          toggleCondition: { buttons: [0, 2], handler: this.#onToggleCondition },
          toggleDocs: this.#onToggleDocs,
        },
        window: {
          controls: [{
            action: "deathBagPull",
            icon: makeIconClass(icons.ui.deathBag, "contextMenu"),
            label: "TERIOCK.EFFECTS.Common.bag",
            ownership: "OWNER",
          }, {
            action: "takeLongRest",
            icon: makeIconClass(icons.ui.longRest, "contextMenu"),
            label: "TERIOCK.SHEETS.Actor.ACTIONS.TakeLongRest.label",
            ownership: "OWNER",
          }, {
            action: "takeShortRest",
            icon: makeIconClass(icons.ui.shortRest, "contextMenu"),
            label: "TERIOCK.SHEETS.Actor.ACTIONS.TakeShortRest.label",
            ownership: "OWNER",
          }],
        },
      };

      /** @inheritDoc */
      async _prepareContext(options = {}) {
        const context = await super._prepareContext(options);
        context.senses = {};
        for (const key of Object.keys(TERIOCK.config.character.sense)) {
          context.senses[key] = {
            source: toRangeHTML(this.document.system._source.senses[key]),
            value: toRangeHTML(this.document.system.senses[key]),
          };
        }
        return context;
      }
    }
  );
}

/**
 * @param {number|null} range
 * @returns {string}
 */
function toRangeHTML(range) {
  if ([Infinity, null].includes(range)) { return asInf(range); }
  return createElement("span", {
    innerText: _loc("TERIOCK.MODELS.BaseUnit.FORMAT", {
      number: range,
      unit: _loc("TERIOCK.MODELS.LengthUnit.UNITS.ft.symbol"),
    }),
  }).outerHTML;
}
