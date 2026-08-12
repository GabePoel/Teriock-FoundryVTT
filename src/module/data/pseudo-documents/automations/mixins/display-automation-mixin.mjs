const { fields } = foundry.data;

/**
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, DisplayAutomation>}
 */
export default function DisplayAutomationMixin(Base) {
  /**
   * @mixin
   * @property {{label: string}} display
   */
  class DisplayAutomation extends Base {
    /** @inheritDoc */
    static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Display"];

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        display: new fields.SchemaField({ label: new fields.StringField({ placeholder: _loc("COMMON.Default") }) }),
      });
    }

    /**
     * Display paths.
     * @returns {string[]}
     */
    get _displayPaths() {
      return ["display.label"];
    }

    /**
     * Display paths if there's no trigger.
     * @returns {string[]}
     */
    get _triggerDisplayPaths() {
      const paths = [];
      const triggerPaths = this._triggerPaths;
      const makesOneButton = (!this._source.trigger || this.isRepeatable || this._defersSelection)
        && !this.makeSeparateActivations;
      if (Array.isArray(triggerPaths)) { paths.push(...triggerPaths); }
      if (makesOneButton) { paths.push(...this._displayPaths); }
      return paths;
    }
  }

  return DisplayAutomation;
}
