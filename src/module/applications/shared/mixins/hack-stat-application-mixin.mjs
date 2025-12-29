/**
 * Mixin allowing hacks and spending dice stats.
 * @param {typeof TeriockDocumentSheet} Base
 */
export default function HackStatApplicationMixin(Base) {
  return (
    /**
     * @extends {TeriockDocumentSheet}
     * @mixin
     * @property {TeriockActor} actor
     * @property {boolean} _consumeStatDie
     */
    class HackStatApplication extends Base {
      /**
       * Rolls a stat die.
       * @param {MouseEvent} _event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>}
       */
      static async _onRollStatDie(_event, target) {
        //noinspection JSUnresolvedReference
        const statDie = this._getStatDie(target);
        let criticallyWounded = this.actor.statuses.has("criticallyWounded");
        await statDie.use(this._consumeStatDie ?? true);
        if (!criticallyWounded) {
          await this.actor.system.takeAwaken();
        }
      }

      /**
       * Hacks a specific body part.
       * @param {MouseEvent} event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>}
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
       * @returns {Promise<void>}
       */
      static async _onTakeUnhack(event, target) {
        event.stopPropagation();
        const part =
          /** @type {Teriock.Parameters.Actor.HackableBodyPart} */ target
            .dataset.part;
        await this.actor.system.takeUnhack(part);
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
          /** @type {TeriockChild & {system: StatGiverMixinInterface}} */
          this.actor[collection].get(id);
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

      /**
       * Unrolls a stat die.
       * @param {MouseEvent} _event - The event object.
       * @param {HTMLElement} target - The target element.
       * @returns {Promise<void>}
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
