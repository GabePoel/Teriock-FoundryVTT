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
     * Apply all suppress automations that force certain children of this document to be suppressed.
     */
    #applySuppressAutomations() {
      const autos = this.automations.getTypeSync("suppress", { active: true, isPassive: true });
      const identifiers = new Set(autos.map(a => a.identifier));
      for (const c of this.parent.modifiable?.contents ?? []) {
        if (identifiers.has(c.identifier)) { c.system.forceSuppressed = true; }
      }
    }

    /**
     * Apply competence and suppress automations to embedded children during document preparation.
     */
    prepareChildAutomations() {
      this.#applySuppressAutomations();
      this.#applyCompetenceAutomations();
    }
  }

  return ActorAutomationPart;
}
