import { PseudoCollectionField } from "../../../../../fields/_module.mjs";
import { affinities, automations, expirations } from "../../../../../pseudo-documents/_module.mjs";
import { BaseAffinity } from "../../../../../pseudo-documents/affinities/abstract/_module.mjs";
import { BaseAutomation } from "../../../../../pseudo-documents/automations/abstract/_module.mjs";
import { BaseExpiration } from "../../../../../pseudo-documents/expirations/abstract/_module.mjs";

/**
 * Actor data model that handles Pseudo-Documents.
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, ActorPseudoDocumentsPart>}
 */
export default function ActorPseudoDocumentsPart(Base) {
  /**
   * @mixin
   * @property {TeriockActor} parent
   * @implements {Teriock.Models.ActorPseudoDocumentsPartData}
   */
  class ActorPseudoDocumentsPart extends Base {
    /** @inheritDoc */
    static get metadata() {
      return foundry.utils.mergeObject(super.metadata, {
        pseudos: { Affinity: "system.affinities", Automation: "system.automations", Expiration: "system.expirations" },
      });
    }

    static buildPseudoCollection(Base, module) {
      return new PseudoCollectionField(Base, {
        persisted: false,
        types: Object.fromEntries(
          Object.values(module).filter((p) => foundry.utils.isSubclass(p, Base)).map((p) => [p.metadata.type, p]),
        ),
      });
    }

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        affinities: this.buildPseudoCollection(BaseAffinity, affinities),
        automations: this.buildPseudoCollection(BaseAutomation, automations),
        expirations: this.buildPseudoCollection(BaseExpiration, expirations),
      });
    }
  }

  return ActorPseudoDocumentsPart;
}
