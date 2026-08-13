const { fields } = foundry.data;

/**
 * Ability flags part.
 *
 * Relevant wiki pages:
 * - [Guildmaster abilities](https://wiki.teriock.com/index.php/Category:Guildmaster_abilities)
 * - [Invoke](https://wiki.teriock.com/index.php/Keyword:Invoke)
 * - [Lore abilities](https://wiki.teriock.com/index.php/Category:Lore_abilities)
 * - [Ritual delivery abilities](https://wiki.teriock.com/index.php/Category:Ritual_delivery_abilities)
 * - [Rotator abilities](https://wiki.teriock.com/index.php/Category:Rotator_abilities)
 * - [Skills](https://wiki.teriock.com/index.php/Category:Skills)
 * - [Spells](https://wiki.teriock.com/index.php/Category:Spells)
 * - [Standard Abilities](https://wiki.teriock.com/index.php/Core:Standard_Abilities)
 * - [Sustained](https://wiki.teriock.com/index.php/Core:Sustained)
 *
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, AbilityInfoPart & Teriock.Models.AbilityFlagsPartData>}
 */
export default function AbilityInfoPart(Base) {
  /**
   * @implements {Teriock.Models.AbilityFlagsPartData}
   * @mixin
   * @property {TeriockActiveEffect<"ability">} parent
   */
  class AbilityInfoPart extends Base {
    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        basic: new fields.BooleanField({ initial: false }),
        // class: new fields.StringField({ choices: TERIOCK.reference.classes }),
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
     * @returns {Teriock.Display.DisplayTag[]}
     */
    get _infoTags() {
      const tags = [];
      if (this.basic) { tags.push(this.getStringForProperty("basic")); }
      if (this.sustained) { tags.push(this.getStringForProperty("sustained")); }
      if (this.standard && !this.skill && !this.spell) { tags.push(this.getStringForProperty("standard")); }
      if (this.standard && this.skill) { tags.push("TERIOCK.COMMON.Semblant"); }
      if (this.skill) { tags.push(this.getStringForProperty("skill")); }
      if (this.standard && this.spell) { tags.push("TERIOCK.COMMON.Conjured"); }
      if (this.spell) { tags.push(this.getStringForProperty("spell")); }
      if (this.invoked) {
        tags.push({ label: "TERIOCK.COSTS.Components.invoked", tooltip: "TERIOCK.SYSTEMS.Ability.FIELDS.costs.label" });
      }
      if (this.ritual) { tags.push(this.getStringForProperty("ritual")); }
      if (this.rotator) { tags.push(this.getStringForProperty("rotator")); }
      if (this.guildmaster) { tags.push(this.getStringForProperty("guildmaster")); }
      // if (this.lore) tags.push("TERIOCK.SYSTEMS.Ability.FIELDS.lore.label");
      return tags;
    }

    /**
     * If this is a true basic ability.
     * @returns {boolean}
     */
    get isBasic() {
      return this.basic && this.parent.parent?.typedIdentifier === "power:basic-abilities";
    }

    /** @inheritDoc */
    getLocalRollData() {
      return Object.assign(super.getLocalRollData(), {
        basic: Number(this.basic),
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

  return AbilityInfoPart;
}
