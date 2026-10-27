import { SummonAutomation } from "../../data/pseudo-documents/automations/_module.mjs";
import { DocumentExecution } from "../abstract/_module.mjs";

/**
 * @property {TeriockItem<"familiar">} source
 */
export default class FamiliarExecution extends DocumentExecution {
  /** @inheritDoc */
  async _buildActivations() {
    const { actorUuid, creatureType } = this.source.system;
    const actor = (actorUuid && await fromUuid(actorUuid)) || await teriock.fromIdentifier(creatureType);
    if (actor) { this.automations.addDocuments([new SummonAutomation({ globalUuids: [actor.uuid] })]); }
    return super._buildActivations();
  }
}
