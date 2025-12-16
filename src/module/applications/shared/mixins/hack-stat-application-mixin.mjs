/**
 * Mixin allowing hacks and spending dice stats.
 * @param {typeof DocumentSheetV2} Base
 */
export default function HackStatApplicationMixin(Base) {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {DocumentSheetV2}
     * @mixin
     * @property {TeriockActor} actor
     */
    class HackStatApplication extends Base {
      /**
       * Rolls a stat die.
       * @param {MouseEvent} _event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>} Promise that resolves when hit die is rolled.
       * @static
       */
      static async _onRollStatDie(_event, target) {
        const id = target.dataset.document;
        const collection = target.dataset.collection;
        const stat = target.dataset.stat;
        const index = target.dataset.index;
        const item =
          /** @type {TeriockChild & {system: StatGiverMixinInterface}} */
          this.actor[collection].get(id);
        const statDie =
          /** @type {StatDieModel} */ item.system.statDice[stat].dice[
            Number(index)
          ];
        //noinspection JSUnresolvedReference
        await statDie.use(this._consumeStatDie);
      }

      /**
       * Hacks a specific body part.
       * @param {MouseEvent} event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>} Promise that resolves when hack is applied.
       * @static
       */
      static async _onTakeHack(event, target) {
        event.stopPropagation();
        const part =
          /** @type {Teriock.Parameters.Actor.HackableBodyPart} */ target
            .dataset.part;
        await this.actor.system.takeHack(part);
      }

      /**
       * Unhacks a specific body part.
       * @param {MouseEvent} event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>} Promise that resolves when hack is applied.
       * @static
       */
      static async _onTakeUnhack(event, target) {
        event.stopPropagation();
        const part =
          /** @type {Teriock.Parameters.Actor.HackableBodyPart} */ target
            .dataset.part;
        await this.actor.system.takeUnhack(part);
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

      /**
       * Unrolls a stat die.
       * @param {MouseEvent} _event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>} Promise that resolves when hit die is rolled.
       * @static
       */
      async _unrollStatDie(_event, target) {
        const id = target.dataset.document;
        const collection = target.dataset.collection;
        const stat = target.dataset.stat;
        const index = target.dataset.index;
        const item =
          /** @type {TeriockChild & {system: StatGiverMixinInterface}} */
          this.actor[collection].get(id);
        const statDie =
          /** @type {StatDieModel} */ item.system.statDice[stat].dice[
            Number(index)
          ];
        await statDie.toggle(false);
      }
    }
  );
}
