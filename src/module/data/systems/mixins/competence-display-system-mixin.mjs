/**
 * @param {typeof ChildSystem} Base
 */
export default function CompetenceDisplaySystemMixin(Base) {
  //noinspection JSClosureCompilerSyntax
  return (
    /**
     * @extends {ChildSystem}
     * @mixin
     */
    class CompetenceDisplaySystem extends Base {
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
