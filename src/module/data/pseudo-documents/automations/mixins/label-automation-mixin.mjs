const { fields } = foundry.data;

/**
 * @param {typeof BaseAutomation} Base
 */
export default function LabelAutomationMixin(Base) {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {BaseAutomation}
     * @mixin
     * @property {string} title
     */
    class LabelAutomation extends Base {
      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = [
        ...super.LOCALIZATION_PREFIXES,
        "TERIOCK.AUTOMATIONS.LabelAutomation",
      ];

      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          title: new fields.StringField(),
        });
      }
    }
  );
}
