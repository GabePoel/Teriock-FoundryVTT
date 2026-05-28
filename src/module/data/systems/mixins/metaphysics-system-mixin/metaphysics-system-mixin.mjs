import { listFormat } from "../../../../helpers/localization.mjs";

const { fields } = foundry.data;

/**
 * Data mixin to support metaphysics tags.
 * @param {typeof ChildSystem} Base
 */
export default function MetaphysicsSystemMixin(Base) {
  return (
    /**
     * @extends {Teriock.Models.MetaphysicsSystemData}
     * @mixes BaseSystem
     * @mixin
     */
    class MetaphysicsSystem extends Base {
      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Metaphysics"];

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          effectTypes: new fields.SetField(new fields.StringField({ choices: TERIOCK.reference.effectTypes })),
          elements: new fields.SetField(new fields.StringField({ choices: TERIOCK.reference.elements })),
          powerSources: new fields.SetField(new fields.StringField({ choices: TERIOCK.reference.powerSources })),
        });
      }

      /**
       * Metaphysics display inputs.
       * @returns {Teriock.Sheet.DisplayField[]}
       */
      get _displayInputsMetaphysics() {
        return ["system.powerSources", "system.elements", "system.effectTypes"];
      }

      /**
       * Metaphysics tags.
       * @returns {Teriock.Sheet.DisplayTag[]}
       */
      get _metaphysicsTags() {
        return [
          ...Array.from(this.powerSources).map(t => {
            return {
              label: TERIOCK.reference.powerSources[t],
              tooltip: "TERIOCK.SYSTEMS.Metaphysics.FIELDS.powerSources.label",
            };
          }),
          ...Array.from(this.elements).map(t => {
            return {
              label: TERIOCK.reference.elements[t],
              tooltip: "TERIOCK.SYSTEMS.Metaphysics.FIELDS.elements.label",
            };
          }),
          ...Array.from(this.effectTypes).filter(t => !this.powerSources.has(t)).map(t => {
            return {
              label: TERIOCK.reference.effectTypes[t],
              tooltip: "TERIOCK.SYSTEMS.Metaphysics.FIELDS.effectTypes.label",
            };
          }),
        ];
      }

      /** @inheritDoc */
      get displayInputs() {
        return [...super.displayInputs, ...this._displayInputsMetaphysics];
      }

      /** @inheritDoc */
      get displayTags() {
        return [...super.displayTags, ...this._metaphysicsTags];
      }

      /**
       * A string representing the elements for this.
       * @returns {string}
       */
      get elementString() {
        if (this.elements.size === 0) return _loc("TERIOCK.TERMS.Common.celestial");
        return listFormat(this.elements.map(e => TERIOCK.reference.elements[e]));
      }

      /** @inheritDoc */
      getLocalRollData() {
        const data = super.getLocalRollData();
        // Add power sources
        for (const powerSource of this.powerSources) data[`power.${powerSource}`] = 1;
        // Add elements
        for (const element of this.elements) {
          data[`element.${element}`] = 1;
          data[`element.${element.slice(0, 3).toLowerCase()}`] = 1;
        }
        // Add effect types
        for (const effectType of this.effectTypes) data[`effect.${effectType}`] = 1;
        return data;
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();

        // Enforce power sources
        for (const ps of this.powerSources) {
          if (Object.keys(TERIOCK.reference.effectTypes).includes(ps) && !this.effectTypes.has(ps))
            this.effectTypes.add(ps);
        }
      }
    }
  );
}
