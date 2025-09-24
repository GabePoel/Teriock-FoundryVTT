/**
 * Mixin allowing hacks and spending dice stats.
 * @param {typeof DocumentSheetV2} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @property {TeriockActor} actor
     * @extends {DocumentSheetV2}
     */
    class HackStatMixin extends Base {
      /**
       * Rolls a stat die.
       * @param {MouseEvent} _event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>} Promise that resolves when hit die is rolled.
       * @static
       */
      static async _rollStatDie(_event, target) {
        const id = target.dataset.id;
        const parentId = target.dataset.parentId;
        const stat = target.dataset.stat;
        /** @type {StatDieModel} */
        const statDie =
          this.actor.items.get(parentId)["system"][`${stat}Dice`][id];
        await statDie.rollStatDie();
      }

      /**
       * Hacks a specific body part.
       * @param {MouseEvent} event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>} Promise that resolves when hack is applied.
       * @static
       */
      static async _takeHack(event, target) {
        event.stopPropagation();
        const part =
          /** @type {Teriock.Parameters.Actor.HackableBodyPart} */ target
            .dataset.part;
        await this.actor.takeHack(part);
      }

      /**
       * Unhacks a specific body part.
       * @param {MouseEvent} event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>} Promise that resolves when hack is applied.
       * @static
       */
      static async _takeUnhack(event, target) {
        event.stopPropagation();
        const part =
          /** @type {Teriock.Parameters.Actor.HackableBodyPart} */ target
            .dataset.part;
        await this.actor.takeUnhack(part);
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
        const id = target.dataset.id;
        const parentId = target.dataset.parentId;
        const stat = target.dataset.stat;
        const item = this.actor.items.get(parentId);
        await item.system[`${stat}Dice`][id].unrollStatDie();
      }
    }
  );
};
