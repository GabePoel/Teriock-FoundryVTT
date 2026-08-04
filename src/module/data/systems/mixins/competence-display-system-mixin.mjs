/**
 * Mixin that adds a competence icon to document embed cards.
 * @template {Constructor<ChildSystem>} T
 * @param {T} Base
 */
export default function CompetenceDisplaySystemMixin(Base) {
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

  return CompetenceDisplaySystem;
}
