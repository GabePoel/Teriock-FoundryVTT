import { listFormat } from "../../../../../../helpers/localization.mjs";
import { TextField } from "../../../../../fields/_module.mjs";

const { fields } = foundry.data;

/**
 * Ability tags part.
 * @param {typeof AbilitySystem} Base
 */
export default Base => {
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
          effectTypes: new fields.SetField(
            new fields.StringField({
              choices: TERIOCK.reference.effectTypes,
            }),
          ),
          elderSorcery: new fields.BooleanField({ initial: false }),
          elderSorceryIncant: new TextField({ initial: "" }),
          elements: new fields.SetField(
            new fields.StringField({
              choices: TERIOCK.reference.elements,
            }),
          ),
        });
      }

      /** @inheritDoc */
      get _displayInputsMetaphysics() {
        return [...super._displayInputsMetaphysics, "system.elements", "system.effectTypes"];
      }

      /** @inheritDoc */
      get _metaphysicsTags() {
        const tags = super._metaphysicsTags;
        tags.push(
          ...Array.from(this.elements).map(t => {
            return {
              label: TERIOCK.reference.elements[t],
              tooltip: "TERIOCK.SYSTEMS.Ability.FIELDS.elements.label",
            };
          }),
          ...Array.from(this.effectTypes)
            .filter(t => !this.powerSources.has(t))
            .map(t => {
              return {
                label: TERIOCK.reference.effectTypes[t],
                tooltip: "TERIOCK.SYSTEMS.Ability.FIELDS.effectTypes.label",
              };
            }),
        );
        if (this.warded) {
          tags.push("TERIOCK.SYSTEMS.Attack.FIELDS.warded.label");
        }
        if (this.elderSorcery) {
          tags.push("TERIOCK.SYSTEMS.Ability.FIELDS.elderSorcery.label");
        }
        tags.push(...super._metaphysicsTags);
        return tags;
      }

      /**
       * A string representing the elements for this ability.
       * @returns {string}
       */
      get elementString() {
        if (this.elements.size === 0) {
          return _loc("TERIOCK.TERMS.Common.celestial");
        }
        return listFormat(this.elements.map(e => TERIOCK.reference.elements[e]));
      }

      /** @inheritDoc */
      getLocalRollData() {
        const data = super.getLocalRollData();
        // Add elements
        for (const element of this.elements) {
          data[`element.${element}`] = 1;
          data[`element.${element.slice(0, 3).toLowerCase()}`] = 1;
        }
        // Add effect types
        for (const effectType of this.effectTypes) {
          data[`effect.${effectType}`] = 1;
        }
        return data;
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();

        // Enforce power sources
        for (const ps of this.powerSources) {
          if (Object.keys(TERIOCK.reference.effectTypes).includes(ps) && !this.effectTypes.has(ps)) {
            this.effectTypes.add(ps);
          }
        }
      }
    }
  );
};
