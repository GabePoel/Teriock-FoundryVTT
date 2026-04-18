import { AutomationCollection } from "../../../../documents/collections/_module.mjs";
import { PseudoCollectionField } from "../../../fields/_module.mjs";
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
       * @returns {(typeof BaseAutomation)[]}
       */
      static get _automationTypes() {
        return [];
      }

      /**
       * The types of automations that this system can have.
       * @returns {Record<string, BaseAutomation>}
       */
      static get automationTypes() {
        return Object.fromEntries(
          this._automationTypes
            .map((a) => [a.TYPE, a])
            .sort((a, b) => a[1].LABEL.localeCompare(b[1].LABEL)),
        );
      }

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          automations: new PseudoCollectionField(BaseAutomation, {
            collection: AutomationCollection,
            types: this.automationTypes,
          }),
        });
      }

      /** @inheritDoc */
      static migrateData(source, options, state) {
        const typeMigrations = {
          addExternal: "addDocuments",
          useExternal: "useDocuments",
          useLocal: "useDocuments",
        };
        if (source.automations && typeof source.automations === "object") {
          for (const automation of Object.values(source.automations)) {
            if (!automation || typeof automation !== "object") continue;
            const migratedType = typeMigrations[automation.type];
            if (migratedType) automation.type = migratedType;
          }
        }
        return super.migrateData(source, options, state);
      }

      /** @inheritDoc */
      get pseudoCollections() {
        return Object.assign(super.pseudoCollections, {
          Automation: this.automations,
        });
      }
    }
  );
}
