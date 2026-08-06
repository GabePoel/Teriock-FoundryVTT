import { migrateKey } from "../../../migrations/source-migrations.mjs";

const { fields } = foundry.data;

/**
 * @template {Constructor<BaseAutomation>} T
 * @param {T} Base
 */
export default function DisplayAutomationMixin(Base) {
  /**
   * @extends {BaseAutomation}
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

    /** @inheritDoc */
    static migrateData(source, options, state) {
      migrateKey(source, "title", "display.label");
      return super.migrateData(source, options, state);
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
      if (Array.isArray(triggerPaths)) { paths.push(...triggerPaths); }
      if (!this._source.trigger || this.isRepeatable) { paths.push(...this._displayPaths); }
      return paths;
    }
  }

  return DisplayAutomation;
}
