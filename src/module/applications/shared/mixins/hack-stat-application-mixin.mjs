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
        event.stopPropagation();
        await this.document.system.takeHack(target.dataset.part);
      }

      /**
       * Unhacks a specific body part.
       * @param {PointerEvent} event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>}
       * @this {HackStatApplication}
       */
      static async _onTakeUnhack(event, target) {
        event.stopPropagation();
        await this.document.system.takeUnhack(target.dataset.part);
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
            el.addEventListener("contextmenu", async (e) => {
              e.preventDefault();
              const target = e.currentTarget;
              await this._unrollStatDie(e, target);
              e.stopPropagation();
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
