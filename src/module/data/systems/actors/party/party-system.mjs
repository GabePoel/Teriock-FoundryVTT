import { BaseActorSystem } from "../_module.mjs";
import { mergeMetadata } from "../../../../utils/construction.mjs";

const { fields } = foundry.data;

export default class PartySystem extends BaseActorSystem {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    associationTypes: ["equipment"],
    childTypes: ["equipment"],
    icon: TERIOCK.DISPLAY.icons.manifest.document.party,
    img: TERIOCK.DISPLAY.thumbnails.manifest.document.party,
    playable: false,
    type: "party",
  });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      members: new fields.SetField(new fields.ForeignDocumentField(foundry.documents.BaseActor)),
    });
  }

  /**
   * The actual members of this party.
   * @returns {Set<TeriockActor>}
   */
  getMembers() {
    return this.members.filter(m => m instanceof Actor.implementation);
  }
}
