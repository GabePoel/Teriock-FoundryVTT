import { mergeFreeze } from "../../../helpers/utils.mjs";
import TeriockBaseActorModel from "../base-actor-data/base-actor-data.mjs";

/**
 * Creature-specific actor data model.
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
    type: "creature",
  });

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    if ((await super._preCreate(data, options, user)) === false) {
      return false;
    }

    const updateData = {
      "system.scaling.brScale": true,
    };

    this.parent.updateSource(updateData);
  }
}
