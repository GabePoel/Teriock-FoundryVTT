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
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          title: new fields.StringField({
            label: "Label",
            hint: "Text to display on the button. Leave blank for default text.",
          }),
        });
      }
    }
  );
}
