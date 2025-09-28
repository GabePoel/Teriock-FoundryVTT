/**
 * Actor data model mixin that handles hacks.
 * @mixin
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends TeriockBaseActorData
     */
    class ActorGenericRollsPart extends Base {
      /**
       * Applies hack effect to a specific part of the actor.
       *
       * Relevant wiki pages:
       * - [Hack](https://wiki.teriock.com/index.php/Damage:Hack)
       *
       * @param {Teriock.Parameters.Actor.HackableBodyPart} part - The part to hack.
       * @returns {Promise<void>} Promise that resolves when hack is applied.
       */
      async takeHack(part) {
        const data = { part };
        await this.parent.hookCall("takeHack", data);
        if (data.cancel) {
          return;
        }
        part = data.part;
        let statusName = part + "Hack";
        if (["arm", "leg"].includes(part)) {
          statusName += "1";
        }
        if (!this.parent.statuses.has(statusName)) {
          await this.parent.toggleStatusEffect(statusName, { active: true });
        } else if (["arm", "leg"].includes(part)) {
          statusName = part + "Hack2";
          if (!this.parent.statuses.has(statusName)) {
            await this.parent.toggleStatusEffect(statusName, { active: true });
          }
        }
      }

      /**
       * Removes hack effect from a specific part of the actor.
       *
       * Relevant wiki pages:
       * - [Hack](https://wiki.teriock.com/index.php/Damage:Hack)
       *
       * @param {Teriock.Parameters.Actor.HackableBodyPart} part - The part to unhack.
       * @returns {Promise<void>} Promise that resolves when unhack is applied.
       */
      async takeUnhack(part) {
        const data = { part };
        await this.parent.hookCall("takeUnhack", data);
        if (data.cancel) {
          return;
        }
        part = data.part;
        let statusName = part + "Hack";
        if (this.parent.statuses.has(statusName + "2")) {
          await this.parent.toggleStatusEffect(statusName + "2", {
            active: false,
          });
        } else if (this.parent.statuses.has(statusName + "1")) {
          await this.parent.toggleStatusEffect(statusName + "1", {
            active: false,
          });
        } else if (this.parent.statuses.has(statusName)) {
          await this.parent.toggleStatusEffect(statusName, { active: false });
        }
      }
    }
  );
};
