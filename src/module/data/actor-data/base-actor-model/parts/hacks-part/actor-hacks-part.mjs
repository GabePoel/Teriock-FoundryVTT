/**
 * Actor data model mixin that handles hacks.
 * @param {typeof TeriockBaseActorModel} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {TeriockBaseActorModel}
     * @mixin
     */
    class ActorGenericRollsPart extends Base {
      /** @inheritDoc */
      getRollData() {
        const rollData = super.getRollData();
        for (const [k, v] of Object.entries(this.hacks || {})) {
          rollData[`hack.${k}`] = v.value;
        }
        return rollData;
      }

      /** @inheritDoc */
      prepareBaseData() {
        super.prepareBaseData();
        this.hacks = {
          arm: hackField(2),
          body: hackField(1),
          ear: hackField(1),
          eye: hackField(1),
          leg: hackField(2),
          mouth: hackField(1),
          nose: hackField(1),
        };
      }

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

/**
 * Define a hack.
 * @param {number} max
 * @returns {{max, min: 0, value: 0}}
 */
function hackField(max) {
  return {
    max: max,
    min: 0,
    value: 0,
  };
}
