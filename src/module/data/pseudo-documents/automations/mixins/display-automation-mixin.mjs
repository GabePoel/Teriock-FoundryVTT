import { migrateKey } from "../../../shared/migrations/source-migrations.mjs";

const { fields } = foundry.data;

/**
 * @param {typeof BaseAutomation} Base
 */
export default function DisplayAutomationMixin(Base) {
  return (
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
          display: new fields.SchemaField({
            label: new fields.StringField({
              label: _loc("TERIOCK.AUTOMATIONS.Display.FIELDS.display.label.label"),
              hint: _loc("TERIOCK.AUTOMATIONS.Display.FIELDS.display.label.hint"),
            }),
          }),
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
        return this._source.trigger ? [] : this._displayPaths;
      }
    }
  );
}
