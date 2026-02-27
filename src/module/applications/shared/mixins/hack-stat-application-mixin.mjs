import { hackOptions } from "../../../constants/options/hack-options.mjs";

/**
 * Mixin allowing hacks and spending dice stats.
 * @param {typeof TeriockDocumentSheet} Base
 */
export default function HackStatApplicationMixin(Base) {
  return (
    /**
     * @extends {TeriockDocumentSheet}
     * @mixin
     * @property {TeriockActor} document
     * @property {boolean} _consumeStatDie
     */
    class HackStatApplication extends Base {
      /**
       * Rolls a stat die.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>}
       * @this {HackStatApplication}
       */
      static async _onRollStatDie(_event, target) {
        const statDie = this._getStatDie(target);
        let criticallyWounded = this.document.statuses.has("criticallyWounded");
        await statDie.use(this._consumeStatDie ?? true);
        if (!criticallyWounded) {
          await this.document.system.takeAwaken();
        }
      }

      /**
       * Hacks a specific body part.
       * @param {PointerEvent} event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>}
       * @this {HackStatApplication}
       */
      static async _onTakeHack(event, target) {
        await onTakeHack(this.document, event, target);
      }

      /**
       * Unhacks a specific body part.
       * @param {PointerEvent} event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>}
       * @this {HackStatApplication}
       */
      static async _onTakeUnhack(event, target) {
        await onTakeUnhack(this.document, event, target);
      }

      /**
       * Whether this hacks in the forward or reverse direction.
       * @returns {boolean}
       */
      get _hackForward() {
        return true;
      }

      /**
       * Get a stat die from an HTML element.
       * @param {HTMLElement} target
       * @returns {StatDieModel}
       */
      _getStatDie(target) {
        const id = target.dataset.document;
        const collection = target.dataset.collection;
        const stat = target.dataset.stat;
        const index = target.dataset.index;
        const item =
          /** @type {TeriockChild & {system: Teriock.Models.StatGiverSystemInterface}} */
          this.document[collection].get(id);
        return item.system.statDice[stat].dice[Number(index)];
      }

      /** @inheritDoc */
      async _onRender(context, options) {
        await super._onRender(context, options);
        this.element
          .querySelectorAll("[data-action=rollStatDie]")
          .forEach((el) => {
            el.addEventListener("contextmenu", async (ev) => {
              ev.preventDefault();
              await this._unrollStatDie(ev, el);
              ev.stopPropagation();
            });
          });
        this.element
          .querySelectorAll("[data-action=takeHack]")
          .forEach((el) => {
            el.addEventListener("contextmenu", async (ev) => {
              ev.preventDefault();
              if (this._hackForward) await onTakeUnhack(this.document, ev, el);
              else await onTakeHack(this.document, ev, el);
            });
          });
      }

      /** @inheritDoc */
      async _prepareContext(options = {}) {
        const context = await super._prepareContext(options);
        return Object.assign(context, {
          bars: {
            hp: this._prepareStatContext(this.document.system.hp),
            mp: this._prepareStatContext(this.document.system.mp),
          },
        });
      }

      /**
       * Widths of stats.
       * @param {object} stat
       * @returns {{remaining, lost, temp, morganti}}
       */
      _prepareStatContext(stat) {
        const total = stat.max + stat.temp + stat.morganti;
        const remaining = Math.round((stat.value / total) * 100);
        const morganti = Math.round((stat.morganti / total) * 100);
        const temp = Math.round((stat.temp / total) * 100);
        const lost = 100 - remaining - morganti - temp;
        return {
          remaining,
          lost,
          temp,
          morganti,
        };
      }

      /**
       * Unrolls a stat die.
       * @param {PointerEvent} _event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>}
       */
      async _unrollStatDie(_event, target) {
        const id = target.dataset.document;
        const collection = target.dataset.collection;
        const stat = target.dataset.stat;
        const index = target.dataset.index;
        const item =
          /** @type {TeriockChild & {system: Teriock.Models.StatGiverSystemInterface}} */
          this.document[collection].get(id);
        const statDie =
          /** @type {StatDieModel} */ item.system.statDice[stat].dice[
            Number(index)
          ];
        await statDie.toggle(false);
      }
    }
  );
}

/**
 * Hack a specific body part.
 * @param {GenericActor} actor
 * @param {PointerEvent} event
 * @param {HTMLElement} target
 * @returns {Promise<void>}
 */
async function onTakeHack(actor, event, target) {
  event.stopPropagation();
  const part = target.dataset.part;
  if (actor.system.hacks[part].value < hackOptions[part].max) {
    await actor.system.takeHack(part);
  } else {
    await actor.system.takeUnhack(part, hackOptions[part].max);
  }
}

/**
 * Unhack a specific body part.
 * @param {GenericActor} actor
 * @param {PointerEvent} event
 * @param {HTMLElement} target
 * @returns {Promise<void>}
 */
async function onTakeUnhack(actor, event, target) {
  event.stopPropagation();
  const part = target.dataset.part;
  if (actor.system.hacks[part].value > 0) {
    await actor.system.takeUnhack(part);
  } else {
    await actor.system.takeHack(part, hackOptions[part].max);
  }
}
