/**
 * @param {typeof ChildTypeModel} Base
 */
export default function ProficiencyDataMixin(Base) {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {ChildTypeModel}
     * @mixin
     */
    class ProficiencyData extends Base {
      /** @inheritDoc */
      get embedIcons() {
        return [
          {
            icon: this.parent.isFluent
              ? "award"
              : this.parent.isProficient
                ? "award-simple"
                : "certificate",
            tooltip: this.parent.isFluent
              ? "Fluent"
              : this.parent.isProficient
                ? "Proficient"
                : "Not Proficient",
          },
          ...super.embedIcons,
        ];
      }
    }
  );
}
