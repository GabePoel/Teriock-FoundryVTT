import { toId } from "../../../../../helpers/string.mjs";

/**
 * Ability automations part.
 * @param {typeof BaseEffectSystem} Base
 */
export default function AbilityAutomationsPart(Base) {
  return (
    /**
     * @extends {BaseEffectSystem}
     * @mixin
     */
    class AbilityAutomationsPart extends Base {
      /** @inheritDoc */
      static migrateData(source, options, state) {
        // The expiration automation has been replaced by dedicated expiration pseudo-documents.
        if (source.automations) {
          if (!source.expirations) { source.expirations = {}; }
          for (const [key, automation] of Object.entries(source.automations)) {
            const type = automation?.type;
            if (type !== "expiration" && type !== "combatExpiration") { continue; }
            delete source.automations[key];
            const override = automation.override ?? {};
            // Legacy `combatExpiration` migration from base mixin.
            const combat = automation.combat ?? { what: automation.what, when: automation.when, who: automation.who };
            if ((type === "combatExpiration" || override.combat) && (combat.what || combat.when || combat.who)) {
              const id = toId(`${automation._id}-combat`, { hash: true });
              const expiration = {
                _id: id,
                event: combat.when?.trigger,
                relation: combat.who?.type,
                skip: combat.when?.skip,
                timing: combat.when?.time,
                type: "combat",
              };
              if (combat.what?.type === "rolled") {
                expiration.method = "roll";
                expiration.roll = { formula: combat.what.roll, threshold: combat.what.threshold };
              }
              source.expirations[id] = expiration;
            }
            if (override.triggers && automation.triggers?.length) {
              const id = toId(`${automation._id}-triggers`, { hash: true });
              source.expirations[id] = { _id: id, triggers: automation.triggers, type: "trigger" };
            }
            if (
              override.conditions && (automation.conditions?.present?.length || automation.conditions?.absent?.length)
            ) {
              const id = toId(`${automation._id}-conditions`, { hash: true });
              source.expirations[id] = {
                _id: id,
                statuses: { absent: automation.conditions.present, present: automation.conditions.absent },
                type: "status",
              };
            }
          }
        }
        return super.migrateData(source, options, state);
      }

      /**
       * The automations that are active right now.
       * @returns {Teriock.Automations.Any[]}
       */
      get activeAutomations() {
        if (this.maneuver !== "passive") { return []; }
        return super.activeAutomations;
      }
    }
  );
}
