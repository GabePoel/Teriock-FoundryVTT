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
      static LOCALIZATION_PREFIXES = [
        ...super.LOCALIZATION_PREFIXES,
        "TERIOCK.AUTOMATIONS.Display",
      ];

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          display: new fields.SchemaField({
            label: new fields.StringField({
              label: _loc(
                "TERIOCK.AUTOMATIONS.Display.FIELDS.display.label.label",
              ),
              hint: _loc(
                "TERIOCK.AUTOMATIONS.Display.FIELDS.display.label.hint",
              ),
            }),
          }),
        });
      }

      /** @inheritDoc */
      static migrateData(data) {
        if (data.title) {
          foundry.utils.setProperty(data, "display.label", data.title);
        }
        return super.migrateData(data);
      }
    }
  );
}
