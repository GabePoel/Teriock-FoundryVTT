import { defaultJSONField } from "../../../fields/helpers/builders.mjs";

const { fields } = foundry.data;

/**
 * @param {typeof BaseAutomation} Base
 */
export default function OverrideDataAutomationMixin(Base) {
  return (
    /**
     * @extends {BaseAutomation}
     * @mixin
     * @property {boolean} overrideData
     * @property {object} data
     */
    class OverrideDataAutomation extends Base {
      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.OverrideData"];

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          data: defaultJSONField(),
          overrideData: new fields.BooleanField({ initial: false }),
        });
      }

      /**
       * Override data paths.
       * @returns {string[]}
       */
      get _overrideDataPaths() {
        const paths = ["overrideData"];
        if (this.overrideData) {
          paths.push("data");
        }
        return paths;
      }
    }
  );
}
