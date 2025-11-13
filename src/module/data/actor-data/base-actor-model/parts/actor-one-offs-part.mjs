import {
  deathBagDialog,
  healDialog,
  revitalizeDialog,
} from "../../../../applications/dialogs/_module.mjs";

/**
 * Actor data model mixin that handles one-offs.
 * @mixin
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends TeriockBaseActorData
     */
    class ActorOneOffsPart extends Base {
      /**
       * Pull from the Death Bag.
       * @returns {Promise<void>}
       */
      async deathBagPull() {
        const data = await this.parent.hookCall("deathBagPull");
        if (data.cancel) {
          return;
        }
        await deathBagDialog(this.actor);
      }

      /**
       * Awakens the actor from sleep.
       *
       * Relevant wiki pages:
       * - [Awaken](https://wiki.teriock.com/index.php/Keyword:Awaken)
       *
       * @returns {Promise<void>} Promise that resolves when the actor is awakened.
       */
      async takeAwaken() {
        const data = await this.parent.hookCall("takeAwaken");
        if (data.cancel) {
          return;
        }
        if (
          this.parent.statuses.has("unconscious") &&
          !this.parent.statuses.has("dead")
        ) {
          if (this.hp.value <= 0) {
            await this.parent.update({ "system.hp.value": 1 });
          }
          if (this.parent.statuses.has("asleep")) {
            await this.parent.toggleStatusEffect("asleep", {
              active: false,
            });
          }
          if (this.parent.statuses.has("unconscious")) {
            await this.parent.toggleStatusEffect("unconscious", {
              active: false,
            });
          }
        }
      }

      /**
       * Heal normally.
       * @param {Teriock.Dialog.HealDialogOptions} [options]
       * @returns {Promise<void>}
       */
      async takeNormalHeal(options = {}) {
        const data = { options };
        await this.parent.hookCall("takeNormalHeal", data);
        if (data.cancel) {
          return;
        }
        await healDialog(this.actor, data.options);
      }

      /**
       * Revitalize normally.
       * @param {Teriock.Dialog.StatDialogOptions} [options]
       * @returns {Promise<void>}
       */
      async takeNormalRevitalize(options = {}) {
        const data = { options };
        await this.parent.hookCall("takeNormalRevitalize", data);
        if (data.cancel) {
          return;
        }
        await revitalizeDialog(this.parent, data.options);
      }

      /**
       * Revives the actor from death.
       *
       * Relevant wiki pages:
       * - [Revival Effects](https://wiki.teriock.com/index.php/Category:Revival_effects)
       *
       * @returns {Promise<void>} Promise that resolves when the actor is revived.
       */
      async takeRevive() {
        const data = await this.parent.hookCall("takeRevive");
        if (data.cancel) {
          return;
        }
        if (this.parent.statuses.has("dead")) {
          if (this.hp.value <= 0) {
            await this.takeHeal(1 - this.hp.value);
          }
          if (this.mp.value <= 0) {
            await this.takeRevitalize(1 - this.mp.value);
          }
          await this.parent.toggleStatusEffect("dead", { active: false });
          const toRemove = this.parent.consequences
            .filter((c) => c.statuses.has("dead"))
            .map((c) => c.id);
          await this.parent.deleteEmbeddedDocuments("ActiveEffect", toRemove);
        }
      }
    }
  );
};
