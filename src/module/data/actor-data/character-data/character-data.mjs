import { mergeFreeze } from "../../../helpers/utils.mjs";
import TeriockBaseActorModel from "../base-actor-data/base-actor-data.mjs";

/**
 * Character-specific actor data model. Currently, this is the only type of actor.
 *
 * Relevant wiki pages:
 * - [Attributes](https://wiki.teriock.com/index.php/Core:Attributes)
 * - [Leveling Up](https://wiki.teriock.com/index.php/Core:Leveling_Up)
 * - [Size](https://wiki.teriock.com/index.php/Core:Size)
 *
 * @extends {TeriockBaseActorModel}
 */
export default class TeriockCharacterModel extends TeriockBaseActorModel {
  /**
   * @inheritDoc
   * @type {Readonly<Teriock.Documents.ActorModelMetadata>}
   */
  static metadata = mergeFreeze(super.metadata, {
    type: "character",
  });
}
