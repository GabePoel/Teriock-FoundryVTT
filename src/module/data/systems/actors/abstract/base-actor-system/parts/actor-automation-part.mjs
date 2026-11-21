/**
 * @import AbstractActorSystem from "../abstract-actor-system.mjs";
 */

/**
 * Actor data model that handles {@link BaseAutomation} application during preparation.
 * @template {MixinBase<typeof AbstractActorSystem>} T
 * @param {T} Base
 */
export default function ActorAutomationPart(Base) {
  /**
   * @mixin
   * @property {TeriockActor} parent
   */
  class ActorAutomationPart extends Base {
    /**
     * Apply all competence automations to this actor's children.
     */
    #applyCompetenceAutomations() {
      let changed = true;
      while (changed) {
        changed = false;
        const levels = new Map();
        for (const a of this.automations.getTypeSync("changeCompetence", { active: true, isPassive: true })) {
          levels.set(a.identifier, Math.max(levels.get(a.identifier) ?? 0, a.competence.raw));
        }
        for (const c of this.parent.modifiable?.contents ?? []) {
          const value = levels.get(c.identifier) ?? 0;
          if (value > c.system.competence.raw && !c.system.lockedPaths?.has("system.competence.raw")) {
            c.system.competence.raw = value;
            foundry.utils.setProperty(c.overrides, "system.competence.raw", value);
            changed = true;
          }
        }
      }
    }

    /**
     * Force children of this actor to be suppressed by suppress automations and behaviors.
     */
    #applySuppressions() {
      const suppressions = [
        ...this.automations.getTypeSync("suppress", { active: true, isPassive: true }).map(a => a.suppression),
        ...Array.from(this.parent._cache.suppressBehaviors ?? [], b => b.system.suppression),
      ];
      if (!suppressions.length) { return; }
      for (const c of this.parent.modifiable?.contents ?? []) {
        if (suppressions.some(s => s.suppresses(c))) { c.system.forceSuppressed = true; }
      }
    }

    /**
     * Apply competence automations, suppress automations, and suppress behaviors to embedded children during document
     * preparation.
     */
    prepareChildAutomations() {
      this.#applySuppressions();
      this.#applyCompetenceAutomations();
    }
  }

  return ActorAutomationPart;
}
