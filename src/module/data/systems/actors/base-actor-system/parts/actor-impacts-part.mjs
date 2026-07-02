import { TeriockDialog } from "../../../../../applications/api/_module.mjs";
import { makeIconClass } from "../../../../../helpers/icon.mjs";
import { barClamp } from "../../../../../helpers/utils.mjs";

const { fields } = foundry.data;

/**
 * Actor data model mixin that handles rollable takes.
 * @param {typeof BaseActorSystem} Base
 */
export default function ActorImpactsPart(Base) {
  return (
    /**
     * @extends {CommonSystem}
     * @mixin
     */
    class ActorImpactsPart extends Base {
      /**
       * Applies harm to a stat that can have a temporary and morganti value.
       *
       * Relevant wiki pages:
       * - [Morganti](https://wiki.teriock.com/index.php/Property:Morganti)
       *
       * @param {number} amount
       * @param {Teriock.Keys.DieStat} stat - The stat to apply the harm to.
       * @param {Teriock.Command.TakeHarmOptions} [options]
       * @returns {Promise<void>}
       */
      async #takeHarm(amount, stat, options = {}) {
        const sp = this[stat];
        const temp = Math.max(0, sp.temp - amount);
        amount = Math.max(0, amount - sp.temp);
        const updateData = { [`system.${stat}.temp`]: temp, [`system.${stat}.value`]: barClamp(sp, -amount) };
        if (options.morganti) { updateData[`system.${stat}.morganti`] = sp.morganti + amount; }
        await this.parent.update(updateData);
      }

      /**
       * An interactive dialog to take some impact.
       * @param {Teriock.Keys.Impact} impact
       * @param {object} [options]
       * @param {number|null} [options.amount]
       * @param {boolean} [options.morganti]
       * @returns {Promise<void>}
       */
      async impactDialog(impact, options = {}) {
        const entry = TERIOCK.config.impact[impact];
        if (!entry) { return; }
        const initialAmount = options.amount ?? (entry.nullable ? null : 0);
        const amountField = new fields.NumberField({
          initial: initialAmount,
          integer: true,
          label: _loc("TERIOCK.AUTOMATIONS.Take.FIELDS.amount.label"),
          min: 0,
          nullable: Boolean(entry.nullable),
          placeholder: entry.nullable ? "" : "0",
        });
        const initialMorganti = Boolean(options.morganti);
        const morgantiField = new fields.BooleanField({
          initial: initialMorganti,
          label: _loc("TERIOCK.TERMS.DamageTypes.morganti"),
        });
        const rootId = foundry.utils.randomID();
        const content = document.createElement("div");
        content.append(amountField.toFormGroup({ rootId }, { name: "amount", value: initialAmount }));
        if (entry.morganti) {
          content.append(morgantiField.toFormGroup({ rootId }, { name: "morganti", value: initialMorganti }));
        }
        await TeriockDialog.prompt({
          content,
          modal: true,
          ok: {
            callback: async (_event, button) => {
              let morganti;
              const value = button.form.elements.namedItem("amount").value;
              const amount = typeof value === "string" && value.length > 0 ? Number(value) : null;
              if (entry.morganti) { morganti = button.form.elements.namedItem("morganti")?.checked; }
              await entry.apply(this.parent, amount, { morganti });
            },
          },
          window: { icon: makeIconClass(entry.icon, "title"), title: entry.take },
        });
      }

      /**
       * Applies damage to the actor's hit points.
       *
       * Relevant wiki pages:
       * - [Damage](https://wiki.teriock.com/index.php/Core:Damage)
       * - [Morganti Damage](https://wiki.teriock.com/index.php/Damage:Morganti)
       *
       * @param {number} amount - The amount of damage to apply.
       * @param {Teriock.Command.TakeHarmOptions} [options]
       * @returns {Promise<void>}
       */
      async takeDamage(amount, options = {}) {
        await this.parent.hookCall("damage", { scope: { amount } });
        await this.#takeHarm(amount, "hp", options);
      }

      /**
       * Applies drain to the actor's mana points.
       *
       * Relevant wiki pages:
       * - [Mana Drain](https://wiki.teriock.com/index.php/Drain:Mana)
       * - [Morganti Drain](https://wiki.teriock.com/index.php/Damage:Morganti)
       *
       * @param {number} amount - The amount of drain to apply.
       * @param {Teriock.Command.TakeHarmOptions} [options]
       * @returns {Promise<void>}
       */
      async takeDrain(amount, options = {}) {
        await this.parent.hookCall("drain", { scope: { amount } });
        await this.#takeHarm(amount, "mp", options);
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
        await this.parent.hookCall("gainTempHp", { scope: { amount } });
        await this.parent.update({ "system.hp.temp": Math.max(this.hp.temp + amount, 0) });
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
        await this.parent.hookCall("gainTempMp", { scope: { amount } });
        await this.parent.update({ "system.mp.temp": Math.max(this.mp.temp + amount, 0) });
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
        await this.parent.hookCall("healing", { scope: { amount } });
        await this.parent.update({ "system.hp.value": barClamp(this.hp, amount) });
      }

      /**
       * Sets the actor's hiding detection score (null = use SNK passive).
       * @param {number|null} amount
       * @returns {Promise<void>}
       */
      async takeHide(amount) {
        await this.parent.hookCall("hide", { scope: { amount } });
        await this.parent.update({ "system.detection.hiding": amount });
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
        await this.parent.hookCall("kill", { scope: { amount } });
        if (this.hp.value <= amount) { await this.parent.toggleStatusEffect("dead", { active: true, overlay: true }); }
      }

      /**
       * Sets the actor's perceiving detection score (null = use PER passive).
       * @param {number|null} amount
       * @returns {Promise<void>}
       */
      async takePerceive(amount) {
        await this.parent.hookCall("perceive", { scope: { amount } });
        await this.parent.update({ "system.detection.perceiving": amount });
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
        await this.parent.hookCall("revitalizing", { scope: { amount } });
        await this.parent.update({ "system.mp.value": barClamp(this.mp, amount) });
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
        await this.parent.hookCall("setTempHp", { scope: { amount } });
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
        await this.parent.hookCall("setTempMp", { scope: { amount } });
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
        await this.parent.hookCall("sleep", { scope: { amount } });
        if (this.hp.value <= amount) {
          await this.parent.toggleStatusEffect("asleep", { active: true, overlay: true });
        }
      }

      /**
       * Applies wither to the actor's lifespan points.
       *
       * Relevant wiki pages:
       * - [Wither](https://wiki.teriock.com/index.php/Drain:Wither)
       *
       * @param {number} amount - The amount of wither to apply.
       * @returns {Promise<void>}
       */
      async takeWither(amount) {
        await this.parent.hookCall("wither", { scope: { amount } });
        await this.parent.update({ "system.lp.value": barClamp(this.lp, amount) });
      }
    }
  );
}
