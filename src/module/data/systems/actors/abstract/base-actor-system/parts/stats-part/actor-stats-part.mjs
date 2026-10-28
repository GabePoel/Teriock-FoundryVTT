import { pathSorterFactory } from "../../../../../../../utils/_module.mjs";
import { initialNumber } from "../../../../../../fields/tools/initializers.mjs";

/**
 * @import AbstractActorSystem from "../../abstract-actor-system.mjs";
 */

const { fields } = foundry.data;

const BAR_STATS = Object.entries(TERIOCK.CONFIG.stat).filter(([_k, v]) => v.bar).map(([k, _v]) => k);

/**
 * Actor data model that handles stats.
 *
 * Relevant wiki pages:
 * - [Hit Points and Mana Points](https://wiki.teriock.com/index.php/Core:Hit_Points_and_Mana_Points)
 * - [Morganti effects](https://wiki.teriock.com/index.php/Category:Morganti_effects)
 * - [Presence](https://wiki.teriock.com/index.php/Core:Presence)
 * - [Wither](https://wiki.teriock.com/index.php/Drain:Wither)
 *
 * @template {MixinBase<typeof AbstractActorSystem>} T
 * @param {T} Base
 */
export default function ActorStatsPart(Base) {
  /**
   * @implements {Teriock.Functionality.StatProvider}
   * @mixin
   * @implements {Teriock.Models.ActorStatsPartData}
   * @property {TeriockActor} parent
   */
  class ActorStatsPart extends /** @type {InitializedDataModel<T, Teriock.Models.ActorStatsPartData>} */ (Base) {
    /** @inheritDoc */
    static defineSchema() {
      const schema = Object.assign(super.defineSchema(), { presence: statField({ initial: 0, max: 1 }) });
      for (const [k, v] of Object.entries(TERIOCK.CONFIG.stat)) {
        if (v?.bar) { schema[k] = statField({ ...v.bar, morganti: v.morganti }); }
      }
      return schema;
    }

    /**
     * Add statuses and explanations for being wounded.
     */
    #prepareVirtualWounds() {
      if (!this.settings.getSetting("autoWound")) { return; }
      const wounds = ["hp", "mp"].map(stat => {
        const { causes, min, value } = this[stat];
        return {
          crit: value === (min < 0 ? min + 1 : 0) && causes.criticallyWounded && causes.down,
          dead: value === min && causes.dead && causes.down,
          stat,
          uncn: value < 1 && causes.unconscious && causes.down,
          value,
        };
      });

      const protDown = this.isProtected("condition:down");
      const autoDead = wounds.some(w => w.dead) && !this.isProtected("condition:dead") && !protDown;
      const autoCrit = wounds.some(w => w.crit) && !this.isProtected("condition:critically-wounded") && !protDown
        && !autoDead;
      const autoUncn = !this.isProtected("condition:unconscious") && !autoCrit && !autoDead && !protDown;

      const add = (w, statuses, reason) =>
        this._addVirtualConditions(
          statuses,
          `TERIOCK.SYSTEMS.BaseActor.VIRTUAL_EFFECTS.${reason}${w.stat.capitalize()}`,
        );
      for (const w of wounds.filter(w => w.dead && autoDead)) { add(w, ["dead", "down"], "negativeHalfMax"); }
      for (const w of wounds.filter(w => w.crit && autoCrit)) {
        add(w, ["critically-wounded", "down"], "criticallyNegative");
      }
      for (const w of wounds.filter(w => w.uncn && autoUncn)) {
        add(w, ["unconscious", "down"], w.value === 0 ? "zero" : "negative");
      }

      if (this.parent.statuses.has("dead")) {
        this.parent.statuses.delete("unconscious");
        this.parent.statuses.delete("critically-wounded");
      }
      if (this.parent.statuses.has("critically-wounded")) { this.parent.statuses.delete("unconscious"); }
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
      if (!foundry.utils.getProperty(options, "teriock.dontDisplayStatChange")) {
        for (const stat of BAR_STATS) {
          const change = foundry.utils.getProperty(options, `teriock.${stat}Change`) ?? 0;
          if (change) {
            const colors = TERIOCK.CONFIG.stat[stat].color;
            this.animateStatChangeEffect(change, change > 0 ? colors.light : colors.dark);
          }
        }
      }
    }

    /**
     * Prepare a specific stat.
     * @param {Teriock.Keys.DieStat} stat
     * @param {TeriockItem[]} items
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

      for (const stat of BAR_STATS) {
        const newStat = foundry.utils.mergeObject(
          foundry.utils.deepClone(this[stat]),
          foundry.utils.getProperty(changes, `system.${stat}`) || {},
        );
        const realChange = newStat.value - this[stat].value;
        const tempChange = (newStat.temp ?? 0) - (this[stat].temp ?? 0);
        foundry.utils.setProperty(options, `teriock.${stat}Change`, realChange + tempChange);
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
          lp: this.lp.value,
          "lp.max": this.lp.max,
          "lp.min": this.lp.min,
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
      const items = [
        ...this.parent.previewedTypes.species.sort(pathSorterFactory("name")),
        ...this.parent.previewedTypes.rank.sort(pathSorterFactory("_stats.createdTime")),
        ...this.parent.previewed.contents.filter(d => d.metadata.tags.simple).sort(pathSorterFactory("name")),
        ...this.parent.previewedTypes.mount.sort(pathSorterFactory("name")),
      ];
      for (const item of items) { item.system.prepareStatDice(); }
      this._prepareStat("hp", items);
      this._prepareStat("mp", items);
    }

    /** @inheritDoc */
    prepareVirtualEffects() {
      this.#prepareVirtualWounds();
      super.prepareVirtualEffects();
    }
  }

  return ActorStatsPart;
}

/**
 * Creates a stat field definition with min, max, and current values, plus optional temp fields.
 * @param {object} [options] - Configuration options for the stat field (the stat's `bar` config plus `morganti`)
 * @param {number} [options.min=0] - Initial minimum value for the stat
 * @param {number} [options.max=1] - Initial maximum value for the stat
 * @param {number} [options.initial=1] - Initial current value for the stat
 * @param {boolean} [options.temp=false] - Whether to include a temporary value
 * @param {boolean} [options.morganti=false] - Whether to include a morganti value
 */
function statField(options = {}) {
  const schema = {
    max: new fields.NumberField({ initial: options.max ?? 1, integer: true, persisted: false }),
    min: new fields.NumberField({ initial: options.min ?? 0, integer: true, persisted: false }),
    value: new fields.NumberField({ initial: options.initial ?? 1, integer: true }),
  };
  if (options.temp) {
    schema.causes = new fields.SchemaField({
      criticallyWounded: new fields.BooleanField({ initial: true, persisted: false }),
      dead: new fields.BooleanField({ initial: true, persisted: false }),
      down: new fields.BooleanField({ initial: true, persisted: false }),
      unconscious: new fields.BooleanField({ initial: true, persisted: false }),
    }, { persisted: false });
    schema.poolLimit = initialNumber();
    schema.temp = new fields.NumberField({ initial: 0, integer: true, min: 0 });
  }
  if (options.morganti) {
    schema.morganti = new fields.NumberField({ initial: 0, integer: true, min: 0, placeholder: "0" });
  }
  return new fields.SchemaField(schema);
}
