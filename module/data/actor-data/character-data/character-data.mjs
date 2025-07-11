import TeriockBaseActorData from "../base-actor-data/base-actor-data.mjs";

/**
 * Character-specific actor data model. Currently, there are only characters.
 * Extends the base actor data with character-specific functionality.
 * @extends {TeriockBaseActorData}
 */
export default class TeriockCharacterData extends TeriockBaseActorData {
  /**
   * Gets the metadata for the character data model.
   * @inheritdoc
   * @returns {object} The metadata object with character type information.
   */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      type: "character",
    });
  }
}
