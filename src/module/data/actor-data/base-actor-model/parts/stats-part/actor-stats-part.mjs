import {
  healDialog,
  revitalizeDialog,
} from "../../../../../applications/dialogs/_module.mjs";
import { docSort } from "../../../../../helpers/sort.mjs";

const { fields } = foundry.data;

/**
 * Actor data model that handles stats.
 * @param {typeof TeriockBaseActorModel} Base
 */
export default (Base) => {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {TeriockBaseActorModel}
     * @implements {ActorStatsPartInterface}
     * @mixin
     */
    class ActorStatsPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        const schema = super.defineSchema();
        Object.assign(schema, {
          hp: new fields.SchemaField({
            max: new fields.NumberField({ initial: 1 }),
            min: new fields.NumberField({ initial: 0 }),
            morganti: new fields.NumberField({ initial: 0 }),
            temp: new fields.NumberField({ initial: 0 }),
            value: new fields.NumberField({ initial: 1 }),
          }),
          mp: new fields.SchemaField({
            max: new fields.NumberField({ initial: 1 }),
            min: new fields.NumberField({ initial: 0 }),
            morganti: new fields.NumberField({ initial: 0 }),
            temp: new fields.NumberField({ initial: 0 }),
            value: new fields.NumberField({ initial: 1 }),
          }),
          presence: statField("Presence", {
            max: 1,
            value: 0,
          }),
          wither: statField("Wither", {
            max: 100,
            value: 20,
          }),
        });
        return schema;
      }

      /** @inheritDoc */
      _onUpdate(changed, options, userId) {
        super._onUpdate(changed, options, userId);
        // The large number catch is used to keep from rendering the stat change upon applying transformations
        if (
          options.teriock.mpChange !== 0 &&
          options.teriock.mpChange < 999999
        ) {
          const color = options.teriock.mpChange > 0 ? "#99C1F1" : "#1A5FB4";
          this.animateStatChangeEffect(options.teriock.mpChange, color).then();
        }
        if (
          options.teriock.hpChange !== 0 &&
          options.teriock.hpChange < 999999
        ) {
          const color = options.teriock.hpChange > 0 ? "#F66151" : "#A51D2D";
          this.animateStatChangeEffect(options.teriock.hpChange, color).then();
        }
        if (
          options.teriock.witherChange !== 0 &&
          options.teriock.witherChange < 999999
        ) {
          const color =
            options.teriock.witherChange > 0 ? "#241F31" : "#5E5C64";
          this.animateStatChangeEffect(
            options.teriock.witherChange,
            color,
          ).then();
        }
      }

      /** @inheritDoc */
      async _preUpdate(changes, options, user) {
        if ((await super._preUpdate(changes, options, user)) === false) {
          return false;
        }
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
          foundry.utils.deepClone(this.wither),
          foundry.utils.getProperty(changes, "system.wither") || {},
        );
        const realHpChange = newHp.value - this.hp.value;
        const tempHpChange = newHp.temp - this.hp.temp;
        const realMpChange = newMp.value - this.mp.value;
        const tempMpChange = newMp.temp - this.mp.temp;
        Object.assign(options.teriock, {
          hpChange: realHpChange + tempHpChange,
          mpChange: realMpChange + tempMpChange,
          witherChange: newWither.value - this.wither.value,
        });
      }

      /**
       * Display an animated state change on active tokens.
       * @param {number} diff
       * @param {string} color
       * @returns {Promise<void>}
       */
      async animateStatChangeEffect(diff, color = "white") {
        if (!diff || !canvas.scene) {
          return;
        }
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
          if (!token.visible || token.document.isSecret) {
            return;
          }
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
            mp: this.mp,
            pres: this.presence.max,
            "pres.unused": this.attributes.unp.score,
            "pres.used": this.presence.value,
            usp: this.presence.value,
            wither: this.wither,
          }),
        );
        return rollData;
      }

      /** @inheritDoc */
      prepareSpecialData() {
        super.prepareSpecialData();
        const diceLimit = Math.floor(this.scaling.lvl / 5);
        const diceStats = ["hp", "mp"];
        this.sheet.dieBox = {};
        const statItems = [
          ...docSort(this.parent.species),
          ...docSort(this.parent.ranks),
          ...docSort(this.parent.mounts),
        ];
        for (const stat of diceStats) {
          let numRanks = 0;
          this[stat].base = 0;
          this.sheet.dieBox[stat] = "";
          for (const item of statItems) {
            if (item.type !== "rank" || numRanks < diceLimit) {
              if (!item.system.statDice[stat].disabled) {
                this[stat].base += item.system.statDice[stat].value;
                this.sheet.dieBox[stat] += item.system.statDice[stat].html;
              }
            }
            if (item.type === "rank" && !item.system.innate) {
              numRanks += 1;
            }
          }
          this[stat].max = Math.max(1, this[stat].base);
          this[stat].min = -Math.floor(this[stat].max / 2);
          this[stat].max -= this[stat].morganti;
          this[stat].value = Math.min(
            Math.max(this[stat].value, this[stat].min),
            this[stat].max,
          );
          this[stat].temp = Math.max(0, this[stat].temp);
        }
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
       * @returns {Promise<void>}
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

/**
 * Creates a stat field definition with min, max, and current values, plus optional base and temp fields.
 * @param {string} name - The name of the stat (e.g., "HP", "MP", "Wither")
 * @param {object} [options] - Configuration options for the stat field
 * @param {number} [options.min=0] - Initial minimum value for the stat
 * @param {number} [options.max=1] - Initial maximum value for the stat
 * @param {number} [options.value=1] - Initial current value for the stat
 * @param {boolean} [options.base=false] - Whether to include a base value field
 * @param {boolean} [options.temp=false] - Whether to include a temporary value field
 */
function statField(name, options = {}) {
  const schema = {
    max: new fields.NumberField({
      initial: options.max ?? 1,
      integer: true,
      label: `Maximum ${name}`,
    }),
    min: new fields.NumberField({
      initial: options.min ?? 0,
      integer: true,
      label: `Minimum ${name}`,
    }),
    value: new fields.NumberField({
      initial: options.value ?? 1,
      integer: true,
      label: `Current ${name}`,
    }),
  };
  if (options.base) {
    schema.base = new fields.NumberField({
      initial: 1,
      integer: true,
      label: `Base ${name}`,
    });
  }
  if (options.temp) {
    schema.temp = new fields.NumberField({
      initial: 0,
      integer: true,
      label: `Temporary ${name}`,
      min: 0,
    });
  }
  return new fields.SchemaField(schema);
}
