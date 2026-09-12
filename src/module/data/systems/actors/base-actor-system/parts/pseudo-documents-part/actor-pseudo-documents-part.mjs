import { PseudoCollectionField } from "../../../../../fields/_module.mjs";
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

    /** @inheritDoc */
    static defineSchema() {
      return Object.assign(super.defineSchema(), {
        affinities: new PseudoCollectionField(BaseAffinity, { persisted: false }),
        automations: new PseudoCollectionField(BaseAutomation, { persisted: false }),
        expirations: new PseudoCollectionField(BaseExpiration, { persisted: false }),
      });
    }
  }

  return ActorPseudoDocumentsPart;
}
