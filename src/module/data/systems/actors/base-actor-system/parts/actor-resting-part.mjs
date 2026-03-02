import { TeriockDialog } from "../../../../../applications/api/_module.mjs";
import { makeIconClass } from "../../../../../helpers/utils.mjs";

export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {BaseActorSystem}
     */
    class ActorRestingPart extends Base {
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
        if (this.parent.statuses.has("dead")) return;
        if (!game.settings.get("teriock", "showLongRestDialog")) return;
        const heal = await TeriockDialog.confirm({
          window: {
            title: game.i18n.localize(
              "TERIOCK.SHEETS.Actor.ACTIONS.TakeLongRest.label",
            ),
            icon: makeIconClass(TERIOCK.display.icons.ui.longRest, "title"),
          },
          content: game.i18n.localize(
            "TERIOCK.SHEETS.Actor.ACTIONS.TakeLongRest.healText",
          ),
          modal: true,
          rejectClose: false,
        });
        if (!heal) return;
        const toUpdate = [];
        for (const item of [
          ...this.parent.ranks,
          ...this.parent.species,
          ...this.parent.mounts,
        ]) {
          const itemUpdates = { _id: item.id };
          const hpDice = item.system.statDice.hp.dice.map((d) => d.toObject());
          for (const d of hpDice) {
            d.spent = false;
          }
          const mpDice = item.system.statDice.mp.dice.map((d) => d.toObject());
          for (const d of mpDice) {
            d.spent = false;
          }
          itemUpdates["system.statDice.hp.dice"] = hpDice;
          itemUpdates["system.statDice.mp.dice"] = mpDice;
          toUpdate.push(itemUpdates);
        }
        await this.parent.updateChildDocuments("Item", toUpdate);
        await this.parent.update({
          "system.hp.value": this.system.hp.max,
          "system.mp.value": this.system.mp.max,
        });
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
