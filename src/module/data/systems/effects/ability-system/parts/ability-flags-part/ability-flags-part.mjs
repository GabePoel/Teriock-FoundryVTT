import { TextField } from "../../../../../fields/_module.mjs";

const { fields } = foundry.data;

/**
 * Ability flags part.
 * @param {typeof AbilitySystem} Base
 */
export default (Base) => {
  return (
    /**
     * @extends {BaseEffectSystem}
     * @extends {Teriock.Models.AbilityFlagsPartData}
     * @mixin
     */
    class AbilityFlagsPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          basic: new fields.BooleanField({ initial: false }),
          class: new fields.StringField({ choices: TERIOCK.reference.classes }),
          consumable: new fields.BooleanField({ initial: false }),
          elderSorcery: new fields.BooleanField({ initial: false }),
          elderSorceryIncant: new TextField({ initial: "" }),
          guildmaster: new fields.BooleanField({ initial: false }),
          invoked: new fields.BooleanField({ initial: false }),
          lore: new fields.BooleanField({ initial: false }),
          ritual: new fields.BooleanField({ initial: false }),
          rotator: new fields.BooleanField({ initial: false }),
          skill: new fields.BooleanField({ initial: false }),
          spell: new fields.BooleanField({ initial: false }),
          standard: new fields.BooleanField({ initial: false }),
          sustained: new fields.BooleanField({ initial: false }),
        });
      }

      /**
       * If this is a true basic ability.
       * @returns {boolean}
       */
      get isBasic() {
        return (
          this.basic &&
          this.parent.parent.name === "Basic Abilities" &&
          this.parent.inCompendium
        );
      }

      /** @inheritDoc */
      getLocalRollData() {
        const data = super.getLocalRollData();
        Object.assign(data, {
          basic: Number(this.basic),
          elderSorcery: Number(this.elderSorcery),
          es: Number(this.elderSorcery),
          guildmaster: Number(this.guildmaster),
          invoked: Number(this.invoked),
          lore: Number(this.lore),
          ritual: Number(this.ritual),
          rotator: Number(this.rotator),
          skill: Number(this.skill),
          spell: Number(this.spell),
          standard: Number(this.standard),
          sustained: Number(this.sustained),
          warded: Number(this.warded),
        });
        if (this.parent.parent?.type === "rank") {
          const rank = /** @type {TeriockRank} */ this.parent.parent;
          data[`class.${rank.system.className.slice(0, 3).toLowerCase()}`] = 1;
          data[`class.${rank.system.className}`] = 1;
        }
        return data;
      }
    }
  );
};
