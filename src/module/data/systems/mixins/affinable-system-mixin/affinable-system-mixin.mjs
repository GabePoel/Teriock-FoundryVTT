import { PseudoCollectionField } from "../../../fields/_module.mjs";
import { BaseAffinity } from "../../../pseudo-documents/affinities/abstract/_module.mjs";

/**
 * Affinities used to be protection automations, keyed by a plural "relation".
 * @type {Record<string, Teriock.Affinities.Type>}
 */
const MIGRATED_RELATIONS = {
  hexproofs: "hexproof",
  hexseals: "hexseal",
  immunities: "immunity",
  resistances: "resistance",
};

/**
 * @param {typeof BaseSystem} Base
 */
export default function AffinableSystemMixin(Base) {
  return (
    /**
     * @extends {BaseSystem}
     * @extends {Teriock.Models.AffinableSystemData}
     * @mixin
     */
    class AffinableSystem extends Base {
      /**
       * Array of the types of affinities that this system can have.
       * @returns {(typeof Teriock.Affinities.Any)[]}
       */
      static get _affinityTypes() {
        return [];
      }

      /**
       * The types of affinities that this system can have.
       * @returns {Record<string, (typeof Teriock.Affinities.Any)>}
       */
      static get affinityTypes() {
        return Object.fromEntries(this._affinityTypes.map(a => [a.TYPE, a]));
      }

      /** @inheritDoc */
      static get metadata() {
        return foundry.utils.mergeObject(super.metadata, { pseudos: { Affinity: "system.affinities" } });
      }

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          affinities: new PseudoCollectionField(BaseAffinity, { types: this.affinityTypes }),
        });
      }

      /**
       * Move protection automations over to affinities, which replaced them.
       * @inheritDoc
       */
      static migrateData(source, options, state) {
        const automations = foundry.utils.getProperty(source, "automations");
        if (foundry.utils.isPlainObject(automations)) {
          for (const [id, automation] of Object.entries(automations)) {
            if (foundry.utils.getProperty(automation, "type") !== "protection") { continue; }
            delete automations[id];
            const type = MIGRATED_RELATIONS[foundry.utils.getProperty(automation, "relation")];
            if (!type) { continue; }
            const affinity = foundry.utils.mergeObject(automation, { type }, { inplace: false });
            delete affinity.relation;
            source.affinities ??= {};
            source.affinities[id] ??= affinity;
          }
        }
        return super.migrateData(source, options, state);
      }

      /**
       * Active affinities.
       * @returns {Teriock.Affinities.Any[]}
       */
      get activeAffinities() {
        return this.affinities.contents.filter(a => a.active && a.valid);
      }
    }
  );
}
