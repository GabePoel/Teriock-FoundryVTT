import { copyItem } from "../../../helpers/fetch.mjs";
import { freeze } from "../../../helpers/utils.mjs";
import { CommonTypeModel } from "../../models/_module.mjs";
import { _migrateData } from "./methods/_migrate-data.mjs";
import * as postUpdate from "./methods/_post-update.mjs";
import { _getRollData } from "./methods/_roll-data.mjs";
import { _baseData } from "./methods/base-data/_base-data.mjs";
import { _prepareDerivedData } from "./methods/derived-data/_derived-data.mjs";
import { _defineSchema } from "./methods/schema/_schema.mjs";
import ActorGenericRollsPart from "./parts/actor-generic-rolls-part.mjs";
import ActorHacksPart from "./parts/actor-hacks-part.mjs";
import ActorOneOffsPart from "./parts/actor-one-offs-part.mjs";
import ActorPayPart from "./parts/actor-pay-part.mjs";
import ActorRollableTakesPart from "./parts/actor-rollable-takes-part.mjs";

/**
 * Base actor data model for the Teriock system.
 * Handles all core actor functionality including damage, healing, rolling, and data management.
 * @extends CommonTypeModel
 * @mixes ActorGenericRollsPart
 * @mixes ActorHacksPart
 * @mixes ActorOneOffsPart
 * @mixes ActorPayPart
 * @mixes ActorRollableTakesPart
 */
export default class TeriockBaseActorModel extends ActorRollableTakesPart(
  ActorPayPart(
    ActorOneOffsPart(ActorHacksPart(ActorGenericRollsPart(CommonTypeModel))),
  ),
) {
  /**
   * Metadata for this actor.
   * @type {Readonly<Teriock.Documents.ActorModelMetadata>}
   */
  static metadata = freeze({
    type: "base",
    childEffectTypes: [
      "ability",
      "attunement",
      "base",
      "condition",
      "consequence",
      "fluency",
      "resource",
    ],
    childItemTypes: [
      "body",
      "equipment",
      "mechanic",
      "power",
      "rank",
      "species",
    ],
    childMacroTypes: [],
  });

  /** @inheritDoc */
  static defineSchema() {
    return _defineSchema();
  }

  /** @inheritDoc */
  static migrateData(data) {
    data = _migrateData(data);
    return super.migrateData(data);
  }

  /**
   * Primary attacking item.
   * @returns {TeriockEquipment|null}
   */
  get primaryAttacker() {
    if (this.wielding.attacker) {
      const item = /** @type {TeriockEquipment} */ this.parent.items.get(
        this.wielding.attacker,
      );
      if (item?.type === "body" || item?.system.isEquipped) {
        return item;
      }
    }
    return null;
  }

  /**
   * Primary blocking item.
   * @returns {TeriockEquipment|null}
   */
  get primaryBlocker() {
    if (this.wielding.blocker) {
      const item = /** @type {TeriockEquipment} */ this.parent.items.get(
        this.wielding.blocker,
      );
      if (item?.type === "body" || item?.system.isEquipped) {
        return item;
      }
    }
    return null;
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    if ((await super._preCreate(data, options, user)) === false) {
      return false;
    }

    // Ensure default items
    const defaultItems = [
      {
        name: "Basic Abilities",
        pack: "essentials",
      },
      {
        name: "Actor Mechanics",
        pack: "essentials",
      },
    ];
    const items = [];
    for (const item of defaultItems) {
      if (!this.parent.items.find((i) => i.name === item.name)) {
        items.push((await copyItem(item.name, item.pack)).toObject());
      }
    }

    // Add Essential Items
    this.parent.updateSource({
      items: items,
      prototypeToken: {
        ring: {
          enabled: true,
        },
      },
    });
  }

  /**
   * Gets roll data for this actor, including all relevant stats and modifiers.
   * @returns {object} The roll data object containing actor stats and modifiers.
   */
  getRollData() {
    return _getRollData(this);
  }

  /**
   * Performs post-update operations for the actor.
   * @param {Teriock.Parameters.Actor.SkipFunctions} skipFunctions - Functions that should be skipped.
   * @returns {Promise<void>} Resolves when all post-update operations are complete
   */
  async postUpdate(skipFunctions) {
    await postUpdate._postUpdate(this, skipFunctions);
  }

  /** @inheritDoc */
  prepareBaseData() {
    _baseData(this);
  }

  /** @inheritDoc */
  prepareDerivedData() {
    _prepareDerivedData(this);
  }
}
