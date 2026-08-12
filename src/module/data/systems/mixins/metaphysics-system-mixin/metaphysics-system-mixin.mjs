import { icons } from "../../../../constants/display/icons.mjs";
import { simplifyTags } from "../../../../helpers/panel.mjs";
import { toKebabCase } from "../../../../helpers/string.mjs";

const { fields } = foundry.data;

/**
 * Data mixin to support metaphysics tags.
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, MetaphysicsSystem & Teriock.Models.MetaphysicsSystemData>}
 */
export default function MetaphysicsSystemMixin(Base) {
  /**
   * @implements {Teriock.Models.MetaphysicsSystemData}
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

    /** @inheritDoc */
    get _displayInputs() {
      return [...super._displayInputs, ...this._displayInputsMetaphysics];
    }

    /**
     * Metaphysics display inputs.
     * @returns {Teriock.Display.DisplayField[]}
     */
    get _displayInputsMetaphysics() {
      return ["system.powerSources", "system.elements", "system.effectTypes"];
    }

    /** @inheritDoc */
    get _displayTags() {
      return [...super._displayTags, ...this._metaphysicsTags];
    }

    /** @inheritDoc */
    get _formPaths() {
      return [...super._formPaths, ...this._formPathsMetaphysics];
    }

    /**
     * Metaphysics form paths.
     * @returns {string[]}
     */
    get _formPathsMetaphysics() {
      return ["powerSources", "elements", "effectTypes"];
    }

    /**
     * Metaphysics panel bar.
     * @returns {Teriock.Panels.PanelBar}
     */
    get _metaphysicsBar() {
      return {
        icon: icons.ability.effectType,
        label: _loc("TERIOCK.SYSTEMS.Ability.PANELS.metaphysics"),
        wrappers: simplifyTags(this._metaphysicsTags),
      };
    }

    /**
     * Metaphysics tags.
     * @returns {Teriock.Display.DisplayTag[]}
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
          return { label: TERIOCK.reference.elements[t], tooltip: "TERIOCK.SYSTEMS.Metaphysics.FIELDS.elements.label" };
        }),
        ...Array.from(this.effectTypes).filter(t => !this.powerSources.has(t)).map(t => {
          return {
            label: TERIOCK.reference.effectTypes[t],
            tooltip: "TERIOCK.SYSTEMS.Metaphysics.FIELDS.effectTypes.label",
          };
        }),
      ];
    }

    /**
     * A string representing the elements for this.
     * @returns {string}
     */
    get elementString() {
      if (this.elements.size === 0) { return _loc("TERIOCK.COMMON.Celestial"); }
      return this.getStringForProperty("elements");
    }

    /** @inheritDoc */
    getLocalRollData() {
      const data = super.getLocalRollData();
      // Add power sources
      for (const powerSource of this.powerSources) { data[`ps.${toKebabCase(powerSource)}`] = 1; }
      // Add elements
      for (const element of this.elements) {
        data[`el.${toKebabCase(element)}`] = 1;
      }
      // Add effect types
      for (const effectType of this.effectTypes) { data[`et.${toKebabCase(effectType)}`] = 1; }
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

  return MetaphysicsSystem;
}
