/**
 * Actor data model that handles {@link BaseAutomation} application during preparation.
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, ActorAutomationPart>}
 */
export default function ActorAutomationPart(Base) {
  /**
   * @mixin
   * @property {TeriockActor} parent
   */
  class ActorAutomationPart extends Base {
    /**
     * Apply all competence automations of a certain value to this actor's children.
     * @param {Teriock.System.CompetenceLevel} value
     */
    #applyCompetenceAutomations(value) {
      const autos = this.parent.appliedEffects.flatMap(e =>
        e.system.automations.getType("changeCompetence", { active: true, competence: value, ongoing: true })
      );
      const identifiers = new Set(autos.map(a => a.identifier));
      for (const c of this.parent.modifiableChildren) {
        if (identifiers.has(c.typedIdentifier) && c.system.competence.raw < value) {
          c.system.competence.raw = value;
        }
      }
    }

    /**
     * Apply all suppress automations that force certain children of this document to be suppressed.
     */
    #applySuppressAutomations() {
      const autos = this.parent.appliedEffects.flatMap(e =>
        e.system.automations.getType("suppress", { active: true, ongoing: true })
      );
      const identifiers = new Set(autos.map(a => a.identifier));
      for (const c of this.parent.modifiableChildren) {
        if (identifiers.has(c.typedIdentifier)) { c.system.forceSuppressed = true; }
      }
    }

    /**
     * Apply competence and suppress automations to embedded children during document preparation.
     */
    prepareChildAutomations() {
      this.#applySuppressAutomations();
      this.#applyCompetenceAutomations(1);
      this.#applyCompetenceAutomations(2);
    }
  }

  return ActorAutomationPart;
}
