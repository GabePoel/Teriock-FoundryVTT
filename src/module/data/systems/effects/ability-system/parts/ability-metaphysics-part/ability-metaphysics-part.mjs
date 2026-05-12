import { listFormat } from "../../../../../../helpers/localization.mjs";
import { TextField } from "../../../../../fields/_module.mjs";

const { fields } = foundry.data;

/**
 * Ability tags part.
 * @param {typeof AbilitySystem} Base
 */
export default (Base) => {
  return (
    /**
     * @extends {BaseEffectSystem}
     * @extends {Teriock.Models.AbilityTagsPartData}
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
          powerSources: new fields.SetField(
            new fields.StringField({
              choices: TERIOCK.reference.powerSources,
            }),
          ),
        });
      }

      /**
       * Metaphysics tags.
       * @returns {Teriock.Sheet.DisplayTag[]}
       */
      get _metaphysicsTags() {
        const tags = [];
        tags.push(
          ...Array.from(this.powerSources).map((t) => {
            return {
              label: TERIOCK.reference.powerSources[t],
              tooltip: "TERIOCK.SYSTEMS.Ability.FIELDS.powerSources.label",
            };
          }),
          ...Array.from(this.elements).map((t) => {
            return {
              label: TERIOCK.reference.elements[t],
              tooltip: "TERIOCK.SYSTEMS.Ability.FIELDS.elements.label",
            };
          }),
          ...Array.from(this.effectTypes)
            .filter((t) => !this.powerSources.has(t))
            .map((t) => {
              return {
                label: TERIOCK.reference.effectTypes[t],
                tooltip: "TERIOCK.SYSTEMS.Ability.FIELDS.effectTypes.label",
              };
            }),
        );
        if (this.warded)
          tags.push("TERIOCK.SYSTEMS.Attack.FIELDS.warded.label");
        if (this.elderSorcery) {
          tags.push("TERIOCK.SYSTEMS.Ability.FIELDS.elderSorcery.label");
        }
        if (this.mundane) {
          tags.push("TERIOCK.SYSTEMS.BaseEffect.FIELDS.mundane.label");
        }
        return tags;
      }

      /** @inheritDoc */
      get color() {
        return TERIOCK.config.effect.form[this.form].color;
      }

      /**
       * A string representing the elements for this ability.
       * @returns {string}
       */
      get elementString() {
        if (this.elements.size === 0) {
          return _loc("TERIOCK.TERMS.Common.celestial");
        }
        return listFormat(
          this.elements.map((e) => TERIOCK.reference.elements[e]),
        );
      }

      /** @inheritDoc */
      getLocalRollData() {
        const data = super.getLocalRollData();
        Object.assign(data, {
          form: this.form,
          [`form.${this.form}`]: 1,
        });
        // Add elements
        for (const element of this.elements) {
          data[`element.${element}`] = 1;
          data[`element.${element.slice(0, 3).toLowerCase()}`] = 1;
        }
        // Add effect types
        for (const effectType of this.effectTypes) {
          data[`effect.${effectType}`] = 1;
        }
        // Add power sources
        for (const powerSource of this.powerSources) {
          data[`power.${powerSource}`] = 1;
        }
        return data;
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();

        // Enforce power sources
        for (const ps of this.powerSources) {
          if (
            Object.keys(TERIOCK.reference.effectTypes).includes(ps) &&
            !this.effectTypes.has(ps)
          ) {
            this.effectTypes.add(ps);
          }
        }
      }
    }
  );
};
