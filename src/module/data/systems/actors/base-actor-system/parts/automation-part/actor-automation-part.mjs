/**
 * Actor data model that handles {@link BaseAutomation} application during preparation.
 * @param {typeof BaseActorSystem} Base
 */
export default Base => {
  return (
    /**
     * @extends {CommonSystem}
     * @mixin
     */
    class ActorAutomationPart extends Base {
      /**
       * Apply all competence automations of a certain value to this actor's children.
       * @param {Teriock.System.CompetenceLevel} value
       */
      #applyCompetenceAutomations(value) {
        const autos = this.parent.validEffects.filter(e => e.active).flatMap(e =>
          e.system.activeAutomations.filter(a => a?.type === "changeCompetence" && a?.competence.value === value)
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
        const autos = this.parent.validEffects.filter(e => e.active).flatMap(e =>
          e.system.activeAutomations.filter(a => a?.type === "suppress")
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
  );
};
