import { icons } from "../../../../../constants/display/icons.mjs";
import { makeIconClass } from "../../../../../helpers/icon.mjs";
import { toKebabCase } from "../../../../../helpers/string.mjs";

/**
 * @param {typeof BaseActorSheet} Base
 */
export default function MechanicalActorSheetPart(Base) {
  return (
    /**
     * @extends {BaseActorSheet}
     * @mixin
     */
    class MechanicalActorSheetPart extends Base {
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
    }
  );
}
