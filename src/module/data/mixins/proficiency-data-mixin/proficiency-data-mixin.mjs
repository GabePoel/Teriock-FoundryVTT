/**
 * @param {typeof ChildTypeModel} Base
 * @constructor
 */
export default function ProficiencyDataMixin(Base) {
  return (
    /**
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
