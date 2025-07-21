import TeriockBaseActorData from "../base-actor-data/base-actor-data.mjs";

/**
 * Character-specific actor data model. Currently, this is the only type of actor.
 *
 * Relevant wiki pages:
 * - [Attributes](https://wiki.teriock.com/index.php/Core:Attributes)
 * - [Leveling Up](https://wiki.teriock.com/index.php/Core:Leveling_Up)
 * - [Size](https://wiki.teriock.com/index.php/Core:Size)
 *
 * @extends {TeriockBaseActorData}
 */
export default class TeriockCharacterData extends TeriockBaseActorData {
  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      type: "character",
    });
  }
}
