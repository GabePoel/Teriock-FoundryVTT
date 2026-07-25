const { fields } = foundry.data;

/**
 * Shared selection options for automations that prompt user choice.
 * @template {Constructor<BaseAutomation>} T
 * @param {T} Base
 */
export default function SelectAutomationMixin(Base) {
  return (
    /**
     * @extends {BaseAutomation}
     * @mixin
     * @property {boolean} all
     * @property {boolean} automatic
     * @property {boolean} multi
     */
    class SelectAutomation extends Base {
      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Select"];

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          all: new fields.BooleanField({ initial: false }),
          automatic: new fields.BooleanField({ initial: true }),
          multi: new fields.BooleanField(),
        });
      }

      /**
       * Paths relating to selection options.
       * @returns {string[]}
       */
      get _selectionOptionPaths() {
        const paths = ["multi"];
        if (this.multi) { paths.push("all"); }
        if (!this.multi || !this.all) { paths.push("automatic"); }
        return paths;
      }
    }
  );
}
