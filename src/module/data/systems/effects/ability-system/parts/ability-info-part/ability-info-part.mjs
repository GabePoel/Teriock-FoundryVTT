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
    class AbilityInfoPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          basic: new fields.BooleanField({ initial: false }),
          class: new fields.StringField({ choices: TERIOCK.reference.classes }),
          consumable: new fields.BooleanField({ initial: false }),
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
       * Information tags.
       * @returns {Teriock.Sheet.DisplayTag[]}
       */
      get _infoTags() {
        const tags = [];
        if (this.basic) tags.push("TERIOCK.SYSTEMS.Ability.FIELDS.basic.label");
        if (this.sustained) {
          tags.push("TERIOCK.SYSTEMS.Ability.FIELDS.sustained.label");
        }
        if (this.standard && !this.skill && !this.spell) {
          tags.push("TERIOCK.SYSTEMS.Ability.FIELDS.standard.label");
        }
        if (this.standard && this.skill)
          tags.push("TERIOCK.TERMS.Common.semblant");
        if (this.skill) tags.push("TERIOCK.SYSTEMS.Ability.FIELDS.skill.label");
        if (this.standard && this.spell)
          tags.push("TERIOCK.TERMS.Common.conjured");
        if (this.spell) tags.push("TERIOCK.SYSTEMS.Ability.FIELDS.spell.label");
        if (this.invoked) {
          tags.push({
            label: "TERIOCK.TERMS.Costs.invoked",
            tooltip: "TERIOCK.SYSTEMS.Ability.FIELDS.costs.label",
          });
        }
        if (this.ritual)
          tags.push("TERIOCK.SYSTEMS.Ability.FIELDS.ritual.label");
        if (this.rotator)
          tags.push("TERIOCK.SYSTEMS.Ability.FIELDS.rotator.label");
        if (this.guildmaster) {
          tags.push("TERIOCK.SYSTEMS.Ability.FIELDS.guildmaster.label");
        }
        //if (this.lore) tags.push("TERIOCK.SYSTEMS.Ability.FIELDS.lore.label");
        return tags;
      }

      /**
       * If this is a true basic ability.
       * @returns {boolean}
       */
      get isBasic() {
        return (
          this.basic &&
          this.parent.parent?.typedIdentifier === "power:basic-abilities"
        );
      }

      /** @inheritDoc */
      getLocalRollData() {
        return Object.assign(super.getLocalRollData(), {
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
      }
    }
  );
};
