/**
 * Actor data model mixin that handles rollable takes.
 * @param {typeof BaseActorSystem} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends BaseActorSystem
     * @mixin
     */
    class ActorRollableTakesPart extends Base {
      /**
       * Applies harm to a stat.
       *
       * Relevant wiki pages:
       * - [Morganti](https://wiki.teriock.com/index.php/Property:Morganti)
       *
       * @param {number} amount
       * @param {Teriock.Parameters.Shared.DieStat} stat - The stat to apply the harm to.
       * @param {object} [options]
       * @param {boolean} [options.morganti] - Make the non-temporary harm morganti.
       * @returns {Promise<void>}
       */
      async #takeHarm(amount, stat, options = {}) {
        const sp = this[stat];
        const temp = Math.max(0, sp.temp - amount);
        amount = Math.max(0, amount - sp.temp);
        const updateData = { [`system.${stat}.temp`]: temp };
        if (options.morganti) {
          updateData[`system.${stat}.morganti`] = sp.morganti + amount;
        } else {
          updateData[`system.${stat}.value`] = Math.max(
            sp.min,
            sp.value - amount,
          );
        }
        await this.parent.update(updateData);
      }

      /**
       * Applies damage to the actor's hit points.
       *
       * Relevant wiki pages:
       * - [Damage](https://wiki.teriock.com/index.php/Core:Damage)
       * - [Morganti Damage](https://wiki.teriock.com/index.php/Damage:Morganti)
       *
       * @param {number} amount - The amount of damage to apply.
       * @param {object} [options]
       * @param {boolean} [options.morganti] - Make the non-temporary damage morganti.
       * @returns {Promise<void>}
       */
      async takeDamage(amount, options = {}) {
        const data = { amount };
        await this.parent.hookCall("takeDamage", data);
        if (data.cancel) return;
        await this.#takeHarm(data.amount, "hp", options);
      }

      /**
       * Applies drain to the actor's mana points.
       *
       * Relevant wiki pages:
       * - [Mana Drain](https://wiki.teriock.com/index.php/Drain:Mana)
       * - [Morganti Drain](https://wiki.teriock.com/index.php/Damage:Morganti)
       *
       * @param {number} amount - The amount of drain to apply.
       * @param {object} [options]
       * @param {boolean} [options.morganti] - Make the non-temporary drain morganti.
       * @returns {Promise<void>}
       */
      async takeDrain(amount, options = {}) {
        const data = { amount };
        await this.parent.hookCall("takeDrain", { data });
        if (data.cancel) return;
        await this.#takeHarm(data.amount, "mp", options);
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
        if (data.cancel) return;
        await this.parent.update({
          "system.hp.temp": Math.max(this.hp.temp + data.amount, 0),
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
        if (data.cancel) return;
        await this.parent.update({
          "system.mp.temp": Math.max(this.mp.temp + data.amount, 0),
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
        if (data.cancel) return;
        const value = Math.min(this.hp.max, this.hp.value + data.amount);
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
        if (data.cancel) return;
        if (this.hp.value <= data.amount) {
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
        if (data.cancel) return;
        const value = Math.min(this.mp.max, this.mp.value + data.amount);
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
        if (data.cancel) return;
        await this.parent.update({ "system.hp.temp": data.amount });
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
        if (data.cancel) return;
        await this.parent.update({ "system.mp.temp": data.amount });
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
        if (data.cancel) return;
        if (this.hp.value <= data.amount) {
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
        if (data.cancel) return;
        const value = Math.min(
          this.wither.max,
          this.wither.value + Number(data.amount),
        );
        await this.parent.update({ "system.wither.value": value });
      }
    }
  );
};
