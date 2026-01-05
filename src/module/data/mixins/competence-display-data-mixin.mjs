/**
 * @param {typeof ChildTypeModel} Base
 */
export default function CompetenceDisplayDataMixin(Base) {
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
            icon: this.competence.icon,
            tooltip: this.competence.description,
          },
          ...super.embedIcons,
        ];
      }
    }
  );
}
