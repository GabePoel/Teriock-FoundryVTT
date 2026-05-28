import { TeriockDialog } from "../../../../../applications/api/_module.mjs";
import { makeIconClass } from "../../../../../helpers/utils.mjs";

export default Base => {
  return (
    /**
     * @extends {CommonSystem}
     */
    class ActorRestingPart extends Base {
      /**
       * @param {object} [options]
       * @param {boolean} [options.hp]
       * @param {boolean} [options.hpDice]
       * @param {boolean} [options.mp]
       * @param {boolean} [options.mpDice]
       * @param {boolean} [options.conditions]
       * @param {boolean} [options.hacks]
       * @param {boolean} [options.cover]
       * @param {boolean} [options.combat]
       */
      async partialReset(options = {}) {
        const actorUpdate = {};
        const itemUpdates = [];
        const statuses = [];
        if (options.hp) { actorUpdate["system.hp.value"] = this.hp.max; }
        if (options.mp) { actorUpdate["system.mp.value"] = this.mp.max; }
        if (options.hpDice || options.mpDice) {
          for (const item of this.parent.items.filter(i => i.metadata.stats)) {
            const itemUpdate = { _id: item.id };
            if (options.hpDice) { itemUpdate["system.statDice.hp.spent"] = []; }
            if (options.mpDice) { itemUpdate["system.statDice.mp.spent"] = []; }
            itemUpdates.push(itemUpdate);
          }
        }
        if (options.conditions) { statuses.push(...Object.values(TERIOCK.data.conditions).map(s => s.id)); }
        if (options.hacks) { statuses.push(...Object.values(TERIOCK.data.hacks).map(s => s.id)); }
        if (options.cover) { statuses.push(...Object.values(TERIOCK.data.cover).map(s => s.id)); }
        if (options.combat) {
          actorUpdate["system.combat.attackPenalty"] = 0;
          actorUpdate["system.combat.hasReaction"] = true;
        }
        await this.parent.updateEmbeddedDocuments("Item", itemUpdates);
        await this.parent.update(actorUpdate);
        await this.parent.removeStatusEffects(statuses.filter(s => this.parent.statuses.has(s)));
      }

      /**
       * Actor experiences dawn.
       * @returns {Promise<void>}
       */
      async takeDawn() {
        await this.actor.hookCall("dawn");
      }

      /**
       * Actor experiences dusk.
       * @returns {Promise<void>}
       */
      async takeDusk() {
        await this.actor.hookCall("dusk");
      }

      /**
       * Take a long rest.
       * @returns {Promise<void>}
       */
      async takeLongRest() {
        await this.parent.hookCall("longRest");
        if (this.parent.statuses.has("dead")) { return; }
        if (!game.teriock.getSetting("showLongRestDialog")) { return; }
        const heal = await TeriockDialog.confirm({
          content: _loc("TERIOCK.SHEETS.Actor.ACTIONS.TakeLongRest.healText"),
          modal: true,
          rejectClose: false,
          window: {
            icon: makeIconClass(TERIOCK.display.icons.ui.longRest, "title"),
            title: _loc("TERIOCK.SHEETS.Actor.ACTIONS.TakeLongRest.label"),
          },
        });
        if (!heal) { return; }
        await this.partialReset({ hp: true, hpDice: true, mp: true, mpDice: true });
      }

      /**
       * Take a short rest.
       * @returns {Promise<void>}
       */
      async takeShortRest() {
        await this.actor.hookCall("shortRest");
      }
    }
  );
};
