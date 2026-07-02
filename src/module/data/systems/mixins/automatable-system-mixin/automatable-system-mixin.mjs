import { PseudoCollectionField } from "../../../fields/_module.mjs";
import { migrateKey, migrateValue } from "../../../migrations/source-migrations.mjs";
import { BaseAutomation } from "../../../pseudo-documents/automations/abstract/_module.mjs";

/**
 * @param {typeof BaseSystem} Base
 */
export default function AutomatableSystemMixin(Base) {
  return (
    /**
     * @extends {BaseSystem}
     * @extends {Teriock.Models.AutomatableSystemData}
     * @mixin
     */
    class AutomatableSystem extends Base {
      /**
       * Array of the types of automations that this system can have.
       * @returns {(typeof Teriock.Automations.Any)[]}
       */
      static get _automationTypes() {
        return [];
      }

      /**
       * The types of automations that this system can have.
       * @returns {Record<string, Teriock.Automations.Any>}
       */
      static get automationTypes() {
        return Object.fromEntries(
          this._automationTypes.map(a => [a.TYPE, a]).sort((a, b) => a[1].LABEL.localeCompare(b[1].LABEL)),
        );
      }

      /** @inheritDoc */
      static get metadata() {
        return foundry.utils.mergeObject(super.metadata, { pseudos: { Automation: "system.automations" } });
      }

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          automations: new PseudoCollectionField(BaseAutomation, { types: this.automationTypes }),
        });
      }

      /** @inheritDoc */
      static migrateData(source, options, state) {
        if (foundry.utils.hasProperty(source, "automations")) {
          for (const a of Object.values(source.automations)) {
            migrateValue(a, "type", "modifyEffect", "override");
            if (foundry.utils.getProperty(a, "type") === "combatExpiration") {
              migrateValue(a, "type", "combatExpiration", "expiration");
              foundry.utils.setProperty(a, "override.combat", true);
              migrateKey(a, "who", "combat.who");
              migrateKey(a, "what", "combat.what");
              migrateKey(a, "when", "combat.when");
            }
          }
        }
        return super.migrateData(source, options, state);
      }
    }
  );
}
