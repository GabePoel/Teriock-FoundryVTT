const { fields } = foundry.data;

/**
 * @param {typeof BaseAutomation} Base
 */
export default function LabelAutomationMixin(Base) {
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

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          title: new fields.StringField(),
        });
      }
    }
  );
}
