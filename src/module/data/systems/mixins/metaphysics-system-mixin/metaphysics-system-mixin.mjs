import { levelField, slugSetField } from "../../../fields/tools/builders.mjs";
import { Panel } from "../../../pseudo-documents/_module.mjs";

/**
 * Data mixin to support metaphysics tags.
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function MetaphysicsSystemMixin(Base) {
  /**
   * @mixin
   * @implements {Teriock.Models.MetaphysicsSystemData}
   */
  class MetaphysicsSystem extends /** @type {InitializedDataModel<T, Teriock.Models.MetaphysicsSystemData>} */ (Base) {
    /** @inheritDoc */
    static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.SYSTEMS.Metaphysics"];

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        effectTypes: slugSetField(TERIOCK.CONFIG.metaphysics.effectTypes),
        elements: slugSetField(TERIOCK.CONFIG.metaphysics.elements),
        illusionLevel: levelField(TERIOCK.CONFIG.metaphysics.illusionLevels),
        powerSources: slugSetField(TERIOCK.CONFIG.metaphysics.powerSources),
        transformationLevel: levelField(TERIOCK.CONFIG.metaphysics.transformationLevels),
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
      return [
        "system.powerSources",
        "system.elements",
        "system.effectTypes",
        "system.illusionLevel",
        "system.transformationLevel",
      ].map(path => ({ group: "metaphysics", path }));
    }

    /** @inheritDoc */
    get _displayTags() {
      return [...super._displayTags, ...this._metaphysicsTags];
    }

    /** @inheritDoc */
    get _formPaths() {
      return [...super._formPaths, { legend: "TERIOCK.COMMON.Metaphysics", paths: this._formPathsMetaphysics }];
    }

    /**
     * Metaphysics form paths.
     * @returns {string[]}
     */
    get _formPathsMetaphysics() {
      return ["powerSources", "elements", "effectTypes", "illusionLevel", "transformationLevel"];
    }

    /**
     * Metaphysics panel bar.
     * @returns {Teriock.Panels.PanelBar}
     */
    get _metaphysicsBar() {
      return {
        icon: TERIOCK.DISPLAY.icons.manifest.ability.effectType,
        label: _loc("TERIOCK.SYSTEMS.Ability.PANELS.metaphysics"),
        wrappers: Panel.simplifyTags(this._metaphysicsTags),
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
            label: TERIOCK.CONFIG.metaphysics.powerSources[t]?.label,
            tooltip: "TERIOCK.SYSTEMS.Metaphysics.FIELDS.powerSources.label",
          };
        }),
        ...Array.from(this.elements).map(t => {
          return {
            label: TERIOCK.CONFIG.metaphysics.elements[t]?.label,
            tooltip: "TERIOCK.SYSTEMS.Metaphysics.FIELDS.elements.label",
          };
        }),
        ...Array.from(this.effectTypes.difference(this.powerSources)).map(t => {
          return {
            label: TERIOCK.CONFIG.metaphysics.effectTypes[t]?.label,
            tooltip: "TERIOCK.SYSTEMS.Metaphysics.FIELDS.effectTypes.label",
          };
        }),
        ...(this.illusionLevel
          ? [{
            label: TERIOCK.CONFIG.metaphysics.illusionLevels[this.illusionLevel],
            tooltip: "TERIOCK.SYSTEMS.Metaphysics.FIELDS.illusionLevel.label",
          }]
          : []),
        ...(this.transformationLevel
          ? [{
            label: TERIOCK.CONFIG.metaphysics.transformationLevels[this.transformationLevel],
            tooltip: "TERIOCK.SYSTEMS.Metaphysics.FIELDS.transformationLevel.label",
          }]
          : []),
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
      for (const powerSource of this.powerSources) { data[`source.${powerSource}`] = 1; }
      // Add elements
      for (const element of this.elements) { data[`element.${element}`] = 1; }
      // Add effect types
      for (const effectType of this.effectTypes) { data[`effect.${effectType}`] = 1; }
      data.illusion = this.illusionLevel;
      data.transformation = this.transformationLevel;
      return data;
    }

    /** @inheritDoc */
    prepareDerivedData() {
      super.prepareDerivedData();

      // Give anything that has a power source the corresponding effect type. Maybe this is a bad decision but like
      // that's the content on the wiki is set up to work.
      for (const ps of this.powerSources) {
        if (ps in TERIOCK.CONFIG.metaphysics.effectTypes && !this.effectTypes.has(ps)) {
          this.effectTypes.add(ps);
        }
      }
    }
  }

  return MetaphysicsSystem;
}
