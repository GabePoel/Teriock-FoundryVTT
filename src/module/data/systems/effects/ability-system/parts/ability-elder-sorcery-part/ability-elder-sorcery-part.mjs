const { fields } = foundry.data;

/**
 * Ability Elder Sorcery part.
 *
 * Relevant wiki pages:
 * - [Elder Sorcery](https://wiki.teriock.com/index.php/Core:Elder_Sorcery)
 *
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function AbilityElderSorceryPart(Base) {
  /**
   * @mixin
   * @implements {Teriock.Models.AbilityElderSorceryPartData}
   * @property {TeriockActiveEffect<"ability">} parent
   */
  class AbilityElderSorceryPart
    extends /** @type {InitializedDataModel<T, Teriock.Models.AbilityElderSorceryPartData>} */ (Base)
  {
    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        elderSorcery: new fields.BooleanField(),
        elderSorceryIncant: new fields.HTMLField(),
      });
    }

    /** @inheritDoc */
    get _metaphysicsTags() {
      const tags = super._metaphysicsTags;
      if (this.warded) { tags.push("TERIOCK.SYSTEMS.Attack.FIELDS.warded.label"); }
      if (this.elderSorcery) { tags.push("TERIOCK.SYSTEMS.Ability.FIELDS.elderSorcery.label"); }
      return tags;
    }

    /**
     * CSS class for this ability's elements.
     * @returns {string}
     */
    get elementClass() {
      if (this.elements.size !== 1) { return "es-multi"; }
      return `es-${this.elements.first()}`;
    }

    /** @inheritDoc */
    async _preCreate(data, options, user) {
      const yes = await super._preCreate(data, options, user);
      if (yes === false) { return false; }

      if (this.parent.master?.type !== "sorcery") { return; }
      if (foundry.utils.hasProperty(this.parent._source, "flags._teriock.sup")) { return; }
      this.parent.updateSource(
        foundry.utils.mergeObject({
          system: { effectTypes: ["magical"], elderSorcery: true, kind: "special", rotator: true, spell: true },
        }, data),
      );
    }

    /** @inheritDoc */
    getLocalRollData() {
      return Object.assign(super.getLocalRollData(), { es: Number(this.elderSorcery) });
    }
  }

  return AbilityElderSorceryPart;
}
