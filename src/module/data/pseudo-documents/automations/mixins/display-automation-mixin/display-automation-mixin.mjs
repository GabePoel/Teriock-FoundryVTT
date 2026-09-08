const { fields } = foundry.data;

/**
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, DisplayAutomation & Teriock.Automations.DisplayAutomationData>}
 */
export default function DisplayAutomationMixin(Base) {
  /**
   * @mixin
   * @implements {Teriock.Automations.DisplayAutomationData}
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
      const paths = [...(this._triggerPaths ?? [])];
      if (!this.makeSeparateActivations && !this.useInExecution) { paths.push(...this._displayPaths); }
      return paths;
    }
  }

  return DisplayAutomation;
}
