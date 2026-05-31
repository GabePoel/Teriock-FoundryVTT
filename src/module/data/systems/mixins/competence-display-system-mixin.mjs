/**
 * @param {typeof ChildSystem} Base
 */
export default function CompetenceDisplaySystemMixin(Base) {
  return (
    /**
     * @extends {ChildSystem}
     * @mixin
     */
    class CompetenceDisplaySystem extends Base {
      /** @inheritDoc */
      get _embedIcons() {
        return [{ icon: this.competence.icon, tooltip: this.competence.description }, ...super._embedIcons];
      }
    }
  );
}
