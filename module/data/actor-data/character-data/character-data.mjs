import TeriockBaseActorData from "../base-data/base-data.mjs";

export default class TeriockCharacterData extends TeriockBaseActorData {
  /** @inheritdoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      type: "character",
    });
  }
}
