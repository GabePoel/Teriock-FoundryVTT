/**
 * Mixin that adds a competence icon to document embed cards.
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, CompetenceDisplaySystem>}
 */
export default function CompetenceDisplaySystemMixin(Base) {
  /** @mixin */
  class CompetenceDisplaySystem extends Base {
    /** @inheritDoc */
    get _embedIcons() {
      return [{ icon: this.competence.icon, tooltip: this.competence.description }, ...super._embedIcons];
    }
  }

  return CompetenceDisplaySystem;
}
