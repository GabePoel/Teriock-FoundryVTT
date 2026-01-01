/**
 * Actor data model mixin that handles rollable takes.
 * @param {typeof TeriockBaseActorModel} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends TeriockBaseActorModel
     * @mixin
     */
    class ActorRollableTakesPart extends Base {
      /**
       * Applies damage to the actor's hit points.
       *
       * Relevant wiki pages:
       * - [Damage](https://wiki.teriock.com/index.php/Core:Damage)
       *
       * @param {number} amount - The amount of damage to apply.
       * @returns {Promise<void>}
       */
      async takeDamage(amount) {
        const data = { amount };
        await this.parent.hookCall("takeDamage", data);
        if (data.cancel) {
          return;
        }
        amount = data.amount;
        const temp = Math.max(0, this.hp.temp - amount);
        amount = Math.max(0, amount - this.hp.temp);
        const value = Math.max(this.hp.min, this.hp.value - amount);
        await this.parent.update({
          "system.hp.value": value,
          "system.hp.temp": temp,
        });
      }

      /**
       * Applies drain to the actor's mana points.
       *
       * Relevant wiki pages:
       * - [Mana Drain](https://wiki.teriock.com/index.php/Drain:Mana)
       *
       * @param {number} amount - The amount of drain to apply.
       * @returns {Promise<void>}
       */
      async takeDrain(amount) {
        const data = { amount };
        await this.parent.hookCall("takeDrain", data);
        if (data.cancel) {
          return;
        }
        amount = data.amount;
        const temp = Math.max(0, this.mp.temp - amount);
        amount = Math.max(0, amount - this.mp.temp);
        const value = Math.max(this.mp.min, this.mp.value - amount);
        await this.parent.update({
          "system.mp.value": value,
          "system.mp.temp": temp,
        });
      }

      /**
       * Gains temporary hit points for the actor.
       *
       * Relevant wiki pages:
       * - [Temporary Hit Points](https://wiki.teriock.com/index.php/Core:Temporary_Hit_Points)
       *
       * @param {number} amount - The number of temporary hit points to gain.
       * @returns {Promise<void>}
       */
      async takeGainTempHp(amount) {
        const data = { amount };
        await this.parent.hookCall("takeGainTempHp", data);
        if (data.cancel) {
          return;
        }
        amount = data.amount;
        await this.parent.update({
          "system.hp.temp": Math.max(this.hp.temp + amount, 0),
        });
      }

      /**
       * Gains temporary mana points for the actor.
       *
       * Relevant wiki pages:
       * - [Temporary Mana Points](https://wiki.teriock.com/index.php/Core:Temporary_Mana_Points)
       *
       * @param {number} amount - The number of temporary mana points to gain.
       * @returns {Promise<void>}
       */
      async takeGainTempMp(amount) {
        const data = { amount };
        await this.parent.hookCall("takeGainTempMp", data);
        if (data.cancel) {
          return;
        }
        amount = data.amount;
        await this.parent.update({
          "system.mp.temp": Math.max(this.mp.temp + amount, 0),
        });
      }

      /**
       * Applies healing to the actor's hit points.
       *
       * Relevant wiki pages:
       * - [Healing](https://wiki.teriock.com/index.php/Core:Healing)
       *
       * @param {number} amount - The amount of healing to apply.
       * @returns {Promise<void>}
       */
      async takeHealing(amount) {
        const data = { amount };
        await this.parent.hookCall("takeHealing", data);
        if (data.cancel) {
          return;
        }
        amount = data.amount;
        const value = Math.min(this.hp.max, this.hp.value + amount);
        await this.parent.update({ "system.hp.value": value });
      }

      /**
       * Applies kill effect to the actor.
       *
       * Relevant wiki pages:
       * - [Death Ray](https://wiki.teriock.com/index.php/Ability:Death_Ray)
       *
       * @param {number} amount - The amount of kill effect to apply.
       * @returns {Promise<void>}
       */
      async takeKill(amount) {
        const data = { amount };
        await this.parent.hookCall("takeKill", data);
        if (data.cancel) {
          return;
        }
        amount = data.amount;
        if (this.hp.value <= amount) {
          await this.parent.toggleStatusEffect("dead", {
            active: true,
            overlay: true,
          });
        }
      }

      /**
       * Applies revitalization to the actor's mana points.
       *
       * Relevant wiki pages:
       * - [Revitalizing](https://wiki.teriock.com/index.php/Core:Revitalizing)
       *
       * @param {number} amount - The amount of revitalization to apply.
       * @returns {Promise<void>}
       */
      async takeRevitalizing(amount) {
        const data = { amount };
        await this.parent.hookCall("takeRevitalizing", data);
        if (data.cancel) {
          return;
        }
        amount = data.amount;
        const value = Math.min(this.mp.max, this.mp.value + amount);
        await this.parent.update({ "system.mp.value": value });
      }

      /**
       * Sets the actor's temporary hit points to a specific amount.
       *
       * Relevant wiki pages:
       * - [Temporary Hit Points](https://wiki.teriock.com/index.php/Core:Temporary_Hit_Points)
       *
       * @param {number} amount - The amount to set temporary hit points to.
       * @returns {Promise<void>}
       */
      async takeSetTempHp(amount) {
        const data = { amount };
        await this.parent.hookCall("takeSetTempHp", data);
        if (data.cancel) {
          return;
        }
        amount = data.amount;
        await this.parent.update({ "system.hp.temp": amount });
      }

      /**
       * Sets the actor's temporary mana points to a specific amount.
       *
       * Relevant wiki pages:
       * - [Temporary Mana Points](https://wiki.teriock.com/index.php/Core:Temporary_Mana_Points)
       *
       * @param {number} amount - The amount to set temporary mana points to.
       * @returns {Promise<void>}
       */
      async takeSetTempMp(amount) {
        const data = { amount };
        await this.parent.hookCall("takeSetTempMp", data);
        if (data.cancel) {
          return;
        }
        amount = data.amount;
        await this.parent.update({ "system.mp.temp": amount });
      }

      /**
       * Applies sleep to the actor.
       *
       * Relevant wiki pages:
       * - [Swift Sleep Aura](https://wiki.teriock.com/index.php/Ability:Swift_Sleep_Aura)
       *
       * @param {number} amount - The amount of sleep to apply.
       * @returns {Promise<void>}
       */
      async takeSleep(amount) {
        const data = { amount };
        await this.parent.hookCall("takeSleep", data);
        if (data.cancel) {
          return;
        }
        amount = data.amount;
        if (this.hp.value <= amount) {
          await this.parent.toggleStatusEffect("asleep", {
            active: true,
            overlay: true,
          });
        }
      }

      /**
       * Applies wither to the actor's hit points.
       *
       * Relevant wiki pages:
       * - [Wither](https://wiki.teriock.com/index.php/Drain:Wither)
       *
       * @param {number} amount - The amount of wither to apply.
       * @returns {Promise<void>}
       */
      async takeWither(amount) {
        const data = { amount };
        await this.parent.hookCall("takeWither", data);
        if (data.cancel) {
          return;
        }
        amount = data.amount;
        const value = Math.min(
          this.wither.max,
          this.wither.value + Number(amount),
        );
        await this.parent.update({ "system.wither.value": value });
      }
    }
  );
};
