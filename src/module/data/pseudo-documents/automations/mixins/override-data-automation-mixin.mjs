const { fields } = foundry.data;

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
      static LOCALIZATION_PREFIXES = [
        ...super.LOCALIZATION_PREFIXES,
        "TERIOCK.AUTOMATIONS.OverrideDataAutomation",
      ];

      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          overrideData: new fields.BooleanField({ initial: false }),
          data: new fields.JSONField(),
        });
      }

      /**
       * Override data paths.
       * @returns {string[]}
       */
      get _overrideDataPaths() {
        const paths = ["overrideData"];
        if (this.overrideData) paths.push("data");
        return paths;
      }
    }
  );
}
