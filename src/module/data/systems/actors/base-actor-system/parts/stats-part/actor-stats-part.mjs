import {
  healDialog,
  revitalizeDialog,
} from "../../../../../../applications/dialogs/_module.mjs";
import { docSort, rankSort } from "../../../../../../helpers/sort.mjs";
import { initialNumber } from "../../../../../fields/helpers/initializers.mjs";

const { fields } = foundry.data;

/**
 * Actor data model that handles stats.
 * @param {typeof BaseActorSystem} Base
 */
export default (Base) => {
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
          hp: statField({ temp: true, morganti: true }),
          mp: statField({ temp: true, morganti: true }),
          presence: statField({ max: 1, value: 0 }),
          lp: statField({ max: 100, value: 20 }),
        });
      }

      /** @inheritDoc */
      _onUpdate(changed, options, userId) {
        super._onUpdate(changed, options, userId);
        if (options.teriock) {
          // The large number catch is used to keep from rendering the stat change upon applying transformations
          if (
            options.teriock.mpChange !== 0 &&
            options.teriock.mpChange < 999999
          ) {
            const color = options.teriock.mpChange > 0 ? "#99C1F1" : "#1A5FB4";
            this.animateStatChangeEffect(options.teriock.mpChange, color);
          }
          if (
            options.teriock.hpChange !== 0 &&
            options.teriock.hpChange < 999999
          ) {
            const color = options.teriock.hpChange > 0 ? "#F66151" : "#A51D2D";
            this.animateStatChangeEffect(options.teriock.hpChange, color);
          }
          if (
            options.teriock.lpChange !== 0 &&
            options.teriock.lpChange < 999999
          ) {
            const color = options.teriock.lpChange > 0 ? "#241F31" : "#5E5C64";
            this.animateStatChangeEffect(options.teriock.lpChange, color);
          }
        }
      }

      /** @inheritDoc */
      async _preUpdate(changes, options, user) {
        const yes = await super._preUpdate(changes, options, user);
        if (yes === false) return false;

        options.teriock ??= {};
        const newHp = foundry.utils.mergeObject(
          foundry.utils.deepClone(this.hp),
          foundry.utils.getProperty(changes, "system.hp") || {},
        );
        const newMp = foundry.utils.mergeObject(
          foundry.utils.deepClone(this.mp),
          foundry.utils.getProperty(changes, "system.mp") || {},
        );
        const newWither = foundry.utils.mergeObject(
          foundry.utils.deepClone(this.lp),
          foundry.utils.getProperty(changes, "system.lp") || {},
        );
        const realHpChange = newHp.value - this.hp.value;
        const tempHpChange = newHp.temp - this.hp.temp;
        const realMpChange = newMp.value - this.mp.value;
        const tempMpChange = newMp.temp - this.mp.temp;
        Object.assign(options.teriock, {
          hpChange: realHpChange + tempHpChange,
          mpChange: realMpChange + tempMpChange,
          lpChange: newWither.value - this.lp.value,
        });
      }

      /**
       * Prepare a specific stat.
       * @param {Teriock.Keys.DieStat} stat
       * @param {AnyItem[]} items
       */
      _prepareStat(stat, items) {
        const statData = this[stat];
        statData._dice = [];
        statData.base = 0;
        let numRanks = 0;
        for (const item of items) {
          if (
            (item.type === "rank" &&
              !item.system.innate &&
              numRanks >= statData.poolLimit) ||
            item.system.statDice[stat].disabled
          ) {
            continue;
          }
          if (item.type === "rank" && !item.system.innate) numRanks += 1;
          statData._dice.push(...item.system.statDice[stat]._dice);
          statData.base += item.system.statDice[stat].value;
        }
        statData.dice = new Collection(statData._dice.map((d) => [d.id, d]));
        statData.max = Math.max(1, statData.base);
        statData.min = -Math.floor(statData.max / 2);
        statData.max -= statData.morganti;
        statData.value = Math.clamp(statData.value, statData.min, statData.max);
        statData.temp = Math.max(0, statData.temp);
      }

      /**
       * Display an animated state change on active tokens.
       * @param {number} diff
       * @param {string} color
       * @returns {Promise<void>}
       */
      async animateStatChangeEffect(diff, color = "white") {
        if (!diff || !canvas.scene) return;
        const tokens =
          /** @type {TeriockToken[]} */ this.parent.getActiveTokens();
        const displayedDiff = diff.signedString();
        const displayArgs = {
          fill: color,
          fontSize: 32,
          stroke: 0x000000,
          strokeThickness: 4,
          direction: diff > 0 ? 2 : 1,
        };
        tokens.forEach((token) => {
          if (!token.visible || token.document.isSecret) return;
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
            hp: this.hp,
            lp: this.lp,
            mp: this.mp,
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
      prepareSpecialData() {
        super.prepareSpecialData();
        this.prepareStatDice();
      }

      /** @inheritDoc */
      prepareStatDice() {
        const items = [
          ...docSort(this.parent.species),
          ...rankSort(this.parent.ranks),
          ...docSort(this.parent.mounts),
        ];
        for (const item of items) {
          item.system.prepareStatDice();
        }
        this._prepareStat("hp", items);
        this._prepareStat("mp", items);
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
      async takeHeal(options = {}) {
        await this.parent.hookCall("takeHeal");
        await healDialog(this.actor, options);
      }

      /**
       * Revitalize normally.
       * @param {Teriock.Dialog.StatDialogOptions} [options]
       * @returns {Promise<void>}
       */
      async takeRevitalize(options = {}) {
        await this.parent.hookCall("takeRevitalize");
        await revitalizeDialog(this.parent, options);
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
          if (this.hp.value <= 0) {
            await this.takeHealing(1 - this.hp.value);
          }
          if (this.mp.value <= 0) {
            await this.takeRevitalizing(1 - this.mp.value);
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
    max: new fields.NumberField({
      initial: options.max ?? 1,
      integer: true,
      persisted: false,
    }),
    min: new fields.NumberField({
      initial: options.min ?? 0,
      integer: true,
      persisted: false,
    }),
    value: new fields.NumberField({
      initial: options.value ?? 1,
      integer: true,
    }),
  };
  if (options.temp) {
    schema.temp = new fields.NumberField({
      initial: 0,
      integer: true,
      min: 0,
    });
    schema.poolLimit = initialNumber();
  }
  if (options.morganti) {
    schema.morganti = new fields.NumberField({
      initial: 0,
      integer: true,
      min: 0,
    });
  }
  return new fields.SchemaField(schema);
}
