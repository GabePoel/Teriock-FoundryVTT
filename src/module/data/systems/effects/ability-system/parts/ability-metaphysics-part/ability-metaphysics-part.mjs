const { fields } = foundry.data;

/**
 * Ability tags part.
 * @param {typeof AbilitySystem} Base
 */
export default function AbilityMetaphysicsPart(Base) {
  return (
    /**
     * @extends {BaseEffectSystem}
     * @extends {Teriock.Models.AbilityTagsPartData}
     * @mixes AdjustableSystem
     * @mixin
     */
    class AbilityMetaphysicsPart extends Base {
      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          elderSorcery: new fields.BooleanField({ initial: false }),
          elderSorceryIncant: new fields.HTMLField({ initial: "" }),
        });
      }

      /** @inheritDoc */
      get _metaphysicsTags() {
        const tags = super._metaphysicsTags;
        if (this.warded) { tags.push("TERIOCK.SYSTEMS.Attack.FIELDS.warded.label"); }
        if (this.elderSorcery) { tags.push("TERIOCK.SYSTEMS.Ability.FIELDS.elderSorcery.label"); }
        return tags;
      }

      /** @inheritDoc */
      getLocalRollData() {
        return Object.assign(super.getLocalRollData(), { es: Number(this.elderSorcery) });
      }
    }
  );
}
