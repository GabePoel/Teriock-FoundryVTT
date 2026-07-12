import { HealManager, RevitalizeManager } from "../../../../../../applications/dialogs/stat-managers/_module.mjs";
import costConfig from "../../../../../../constants/config/cost-config.mjs";
import { docSort, rankSort } from "../../../../../../helpers/sort.mjs";
import { initialNumber } from "../../../../../fields/tools/initializers.mjs";

const { fields } = foundry.data;

const BAR_STATS = Object.entries(costConfig.primary.keys).filter(([_k, v]) => v.barStat).map(([k, _v]) => k);

/**
 * Actor data model that handles stats.
 * @param {typeof BaseActorSystem} Base
 */
export default function ActorStatsPart(Base) {
  return (
    /**
     * @extends {CommonSystem}
     * @extends {Teriock.Models.ActorStatsPartData}
     * @implements {Teriock.Functionality.StatProvider}
     * @mixin
     */
    class ActorStatsPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          hp: statField({ morganti: true, temp: true }),
          lp: statField({ max: 100, value: 20 }),
          mp: statField({ morganti: true, temp: true }),
          presence: statField({ max: 1, value: 0 }),
        });
      }

      /**
       * Add statuses and explanations for being wounded.
       */
      #prepareVirtualWounds() {
        if (!this.settings.getSetting("autoWound")) { return; }
        const hpUncn = this.hp.value < 1;
        const hpCrit = this.hp.value === (this.hp.min < 0 ? this.hp.min + 1 : 0);
        const hpDead = this.hp.value === this.hp.min;
        const mpUncn = this.mp.value < 1;
        const mpCrit = this.mp.value === (this.mp.min < 0 ? this.mp.min + 1 : 0);
        const mpDead = this.mp.value === this.mp.min;

        const statDead = hpDead || mpDead;
        const statCrit = hpCrit || mpCrit;

        const protUncn = this.isProtected("statuses", "unconscious");
        const protCrit = this.isProtected("statuses", "criticallyWounded");
        const protDead = this.isProtected("statuses", "dead");
        const protDown = this.isProtected("statuses", "down");

        const autoDead = statDead && !protDead && !protDown;
        const autoCrit = statCrit && !protCrit && !protDown && !autoDead;

        if (hpDead && !protDead && !protDown) {
          this._addVirtualStatuses(["dead", "down"], "TERIOCK.SYSTEMS.BaseActor.VIRTUAL_EFFECTS.negativeHalfMaxHp");
        }
        if (mpDead && !protDead && !protDown) {
          this._addVirtualStatuses(["dead", "down"], "TERIOCK.SYSTEMS.BaseActor.VIRTUAL_EFFECTS.negativeHalfMaxMp");
        }
        if (hpCrit && !protCrit && !protDown && !autoDead) {
          this._addVirtualStatuses(
            ["criticallyWounded", "down"],
            "TERIOCK.SYSTEMS.BaseActor.VIRTUAL_EFFECTS.criticallyNegativeHp",
          );
        }
        if (mpCrit && !protCrit && !protDown && !autoDead) {
          this._addVirtualStatuses(
            ["criticallyWounded", "down"],
            "TERIOCK.SYSTEMS.BaseActor.VIRTUAL_EFFECTS.criticallyNegativeMp",
          );
        }
        if (hpUncn && !protUncn && !autoCrit && !autoDead && !protDown) {
          if (this.hp.value === 0) {
            this._addVirtualStatuses(["unconscious", "down"], "TERIOCK.SYSTEMS.BaseActor.VIRTUAL_EFFECTS.zeroHp");
          } else {
            this._addVirtualStatuses(["unconscious", "down"], "TERIOCK.SYSTEMS.BaseActor.VIRTUAL_EFFECTS.negativeHp");
          }
        }
        if (mpUncn && !protUncn && !autoCrit && !autoDead && !protDown) {
          if (this.mp.value === 0) {
            this._addVirtualStatuses(["unconscious", "down"], "TERIOCK.SYSTEMS.BaseActor.VIRTUAL_EFFECTS.zeroMp");
          } else {
            this._addVirtualStatuses(["unconscious", "down"], "TERIOCK.SYSTEMS.BaseActor.VIRTUAL_EFFECTS.negativeMp");
          }
        }

        if (this.parent.statuses.has("dead")) {
          this.parent.statuses.delete("unconscious");
          this.parent.statuses.delete("criticallyWounded");
        }
        if (this.parent.statuses.has("criticallyWounded")) { this.parent.statuses.delete("unconscious"); }
      }

      /**
       * Is this actor damaged?
       * @returns {boolean}
       */
      get isDamaged() {
        return this.hp.value < this.hp.max || this.parent.statuses.has("hacked");
      }

      /**
       * Is this actor drained?
       * @returns {boolean}
       */
      get isDrained() {
        return this.mp.value < this.mp.max;
      }

      /** @inheritDoc */
      _onUpdate(changed, options, userId) {
        super._onUpdate(changed, options, userId);
        if (options.teriock) {
          for (const stat of BAR_STATS) {
            const change = options.teriock[`${stat}Change`];
            // The large number catch is used to keep from rendering the stat change upon applying transformations
            if (change !== 0 && change < TERIOCK.config.system.inf / 2) {
              const colors = TERIOCK.display.colors[stat];
              this.animateStatChangeEffect(change, change > 0 ? colors.light : colors.dark);
            }
          }
        }
      }

      /**
       * Prepare a specific stat.
       * @param {Teriock.Keys.DieStat} stat
       * @param {AnyItem[]} items
       */
      _prepareStat(stat, items) {
        const statData = this[stat];
        const dice = [];
        statData.base = 0;
        let numRanks = 0;
        for (const item of items) {
          if (
            (item.type === "rank" && !item.system.innate && numRanks >= statData.poolLimit)
            || item.system.statDice[stat].disabled
          ) {
            continue;
          }
          if (item.type === "rank" && !item.system.innate) { numRanks += 1; }
          dice.push(...item.system.statDice[stat].dice.contents);
          statData.base += item.system.statDice[stat].value;
        }
        statData.dice = new Collection(dice.map(d => [d.id, d]));
        statData.max = Math.max(1, statData.base);
        statData.min = -Math.floor(statData.max / 2);
        statData.max -= statData.morganti;
        statData.value = Math.clamp(statData.value, statData.min, statData.max);
        statData.temp = Math.max(0, statData.temp);
      }

      /** @inheritDoc */
      async _preUpdate(changes, options, user) {
        const yes = await super._preUpdate(changes, options, user);
        if (yes === false) { return false; }

        options.teriock ??= {};
        for (const stat of BAR_STATS) {
          const newStat = foundry.utils.mergeObject(
            foundry.utils.deepClone(this[stat]),
            foundry.utils.getProperty(changes, `system.${stat}`) || {},
          );
          const realChange = newStat.value - this[stat].value;
          const tempChange = (newStat.temp ?? 0) - (this[stat].temp ?? 0);
          options.teriock[`${stat}Change`] = realChange + tempChange;
        }
      }

      /**
       * Display an animated state change on active tokens.
       * @param {number} diff
       * @param {string} color
       * @returns {Promise<void>}
       */
      async animateStatChangeEffect(diff, color = "white") {
        if (!diff || !canvas.scene) { return; }
        const tokens = /** @type {TeriockToken[]} */ this.parent.getActiveTokens();
        const displayedDiff = diff.signedString();
        const displayArgs = {
          direction: diff > 0 ? 2 : 1,
          fill: color,
          fontSize: 32,
          stroke: 0x000000,
          strokeThickness: 4,
        };
        tokens.forEach(token => {
          if (!token.visible || token.document.isSecret) { return; }
          const scrollingTextArgs = [token.center, displayedDiff, displayArgs];
          canvas.interface.createScrollingText(...scrollingTextArgs);
        });
      }

      /** @inheritDoc */
      getRollData() {
        const rollData = super.getRollData();
        Object.assign(
          rollData,
          foundry.utils.flattenObject({
            hp: this.hp.value,
            "hp.max": this.hp.max,
            "hp.min": this.hp.min,
            "hp.morganti": this.hp.morganti,
            "hp.temp": this.hp.temp,
            lp: this.lp,
            mp: this.mp.value,
            "mp.max": this.mp.max,
            "mp.min": this.mp.min,
            "mp.morganti": this.mp.morganti,
            "mp.temp": this.mp.temp,
            pres: this.presence.max,
            "pres.unused": this.attributes.unp.score,
            "pres.used": this.presence.value,
            usp: this.presence.value,
          }),
        );
        return rollData;
      }

      /** @inheritDoc */
      prepareBaseData() {
        super.prepareBaseData();
        const poolLimit = Math.floor(this.scaling.lvl / 5);
        this.hp.poolLimit = poolLimit;
        this.mp.poolLimit = poolLimit;
      }

      /** @inheritDoc */
      prepareCleanupData() {
        super.prepareCleanupData();
        this.hp.value = Math.clamp(this.hp.value, this.hp.min, this.hp.max);
        this.lp.value = Math.clamp(this.lp.value, this.lp.min, this.lp.max);
        this.mp.value = Math.clamp(this.mp.value, this.mp.min, this.mp.max);
      }

      /** @inheritDoc */
      prepareSpecialData() {
        super.prepareSpecialData();
        this.prepareStatDice();
      }

      /** @inheritDoc */
      prepareStatDice() {
        const items = [...docSort(this.parent.species), ...rankSort(this.parent.ranks), ...docSort(this.parent.mounts)];
        for (const item of items) { item.system.prepareStatDice(); }
        this._prepareStat("hp", items);
        this._prepareStat("mp", items);
      }

      /** @inheritDoc */
      prepareVirtualEffects() {
        this.#prepareVirtualWounds();
        super.prepareVirtualEffects();
      }

      /**
       * Awakens the actor from sleep.
       *
       * Relevant wiki pages:
       * - [Awaken](https://wiki.teriock.com/index.php/Keyword:Awaken)
       *
       * @returns {Promise<void>}
       */
      async takeAwaken() {
        await this.parent.hookCall("takeAwaken");
        if (this.parent.statuses.has("unconscious") && !this.parent.statuses.has("dead")) {
          if (this.hp.value <= 0) { await this.parent.update({ "system.hp.value": 1 }); }
          if (this.parent.statuses.has("asleep")) { await this.parent.toggleStatusEffect("asleep", { active: false }); }
          if (this.parent.statuses.has("unconscious")) {
            await this.parent.toggleStatusEffect("unconscious", { active: false });
          }
        }
      }

      /**
       * Heal normally.
       * @param {Teriock.Dialog.HealDialogOptions} [options]
       * @returns {Promise<void>}
       */
      async takeHeal(options = {}) {
        await this.parent.hookCall("takeHeal");
        await HealManager.create(this.actor, options);
      }

      /**
       * Revitalize normally.
       * @param {Teriock.Dialog.StatDialogOptions} [options]
       * @returns {Promise<void>}
       */
      async takeRevitalize(options = {}) {
        await this.parent.hookCall("takeRevitalize");
        await RevitalizeManager.create(this.actor, options);
      }

      /**
       * Revives the actor from death.
       *
       * Relevant wiki pages:
       * - [Revival Effects](https://wiki.teriock.com/index.php/Category:Revival_effects)
       *
       * @returns {Promise<void>}
       */
      async takeRevive() {
        await this.parent.hookCall("takeRevive");
        if (this.parent.statuses.has("dead")) {
          if (this.hp.value <= 0) { await this.takeHealing(1 - this.hp.value); }
          if (this.mp.value <= 0) { await this.takeRevitalizing(1 - this.mp.value); }
          await this.parent.toggleStatusEffect("dead", { active: false });
          const toDelete = this.parent.applicables.filter(c => c.statuses.has("dead")).map(c => c.id);
          await this.parent.deleteEmbeddedDocuments("ActiveEffect", toDelete);
        }
      }
    }
  );
}

/**
 * Creates a stat field definition with min, max, and current values, plus optional base and temp fields.
 * @param {object} [options] - Configuration options for the stat field
 * @param {number} [options.min=0] - Initial minimum value for the stat
 * @param {number} [options.max=1] - Initial maximum value for the stat
 * @param {number} [options.value=1] - Initial current value for the stat
 * @param {boolean} [options.base=false] - Whether to include a base value
 * @param {boolean} [options.temp=false] - Whether to include a temporary value
 * @param {boolean} [options.morganti=false] - Whether to include a morganti value
 */
function statField(options = {}) {
  const schema = {
    max: new fields.NumberField({ initial: options.max ?? 1, integer: true, persisted: false }),
    min: new fields.NumberField({ initial: options.min ?? 0, integer: true, persisted: false }),
    value: new fields.NumberField({ initial: options.value ?? 1, integer: true }),
  };
  if (options.temp) {
    schema.temp = new fields.NumberField({ initial: 0, integer: true, min: 0 });
    schema.poolLimit = initialNumber();
  }
  if (options.morganti) { schema.morganti = new fields.NumberField({ initial: 0, integer: true, min: 0 }); }
  return new fields.SchemaField(schema);
}
