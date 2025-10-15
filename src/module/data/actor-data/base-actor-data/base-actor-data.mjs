import { copyItem } from "../../../helpers/fetch.mjs";
import { freeze } from "../../../helpers/utils.mjs";
import { CommonTypeModel } from "../../models/_module.mjs";
import { _migrateData } from "./methods/_migrate-data.mjs";
import * as postUpdate from "./methods/_post-update.mjs";
import { _getRollData } from "./methods/_roll-data.mjs";
import { _baseData } from "./methods/base-data/_base-data.mjs";
import { _prepareDerivedData } from "./methods/derived-data/_derived-data.mjs";
import { _defineSchema } from "./methods/schema/_schema.mjs";
import { _prepareSpecialData } from "./methods/special-data/_special-data.mjs";
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
  //noinspection JSValidateTypes
  /**
   * Metadata for this actor.
   * @type {Readonly<Teriock.Documents.ActorModelMetadata>}
   */
  static metadata = freeze({
    childEffectTypes: [
      "ability",
      "attunement",
      "base",
      "condition",
      "consequence",
      "fluency",
      "resource",
    ],
    childItemTypes: ["body", "equipment", "power", "rank", "species", "mount"],
    childMacroTypes: [],
    collection: "actors",
    type: "base",
  });

  /** @inheritDoc */
  static defineSchema() {
    const schema = super.defineSchema();
    return _defineSchema(schema);
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
  _onUpdate(changed, options, userId) {
    super._onUpdate(changed, options, userId);
    if (options.teriock.mpChange !== 0) {
      const color = options.teriock.mpChange > 0 ? "#99C1F1" : "#1A5FB4";
      this.animateStatChangeEffect(options.teriock.mpChange, color).then();
    }
    if (options.teriock.hpChange !== 0) {
      const color = options.teriock.hpChange > 0 ? "#F66151" : "#A51D2D";
      this.animateStatChangeEffect(options.teriock.hpChange, color).then();
    }
    if (options.teriock.witherChange !== 0) {
      const color = options.teriock.witherChange > 0 ? "#241F31" : "#5E5C64";
      this.animateStatChangeEffect(options.teriock.witherChange, color).then();
    }
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

  /** @inheritDoc */
  async _preUpdate(changes, options, user) {
    if ((await super._preUpdate(changes, options, user)) === false) {
      return false;
    }
    options.teriock ??= {};
    const newHp = foundry.utils.mergeObject(
      foundry.utils.deepClone(this.hp),
      foundry.utils.getProperty(changes, "system.hp") || {},
    );
    const newMp = foundry.utils.mergeObject(
      foundry.utils.deepClone(this.mp),
      foundry.utils.getProperty(changes, "system.mp") || {},
    );
    const newWither = foundry.utils.mergeObject(
      foundry.utils.deepClone(this.wither),
      foundry.utils.getProperty(changes, "system.wither") || {},
    );
    const realHpChange = newHp.value - this.hp.value;
    const tempHpChange = newHp.temp - this.hp.temp;
    const realMpChange = newMp.value - this.mp.value;
    const tempMpChange = newMp.temp - this.mp.temp;
    Object.assign(options.teriock, {
      hpChange: realHpChange + tempHpChange,
      mpChange: realMpChange + tempMpChange,
      witherChange: newWither.value - this.wither.value,
    });
  }

  /**
   * Display an animated state change on active tokens.
   * @param {number} diff
   * @param {string} color
   * @returns {Promise<void>}
   */
  async animateStatChangeEffect(diff, color = "white") {
    if (!diff || !canvas.scene) {
      return;
    }
    const tokens = /** @type {TeriockToken[]} */ this.parent.getActiveTokens();
    const displayedDiff = diff.signedString();
    const displayArgs = {
      fill: color,
      fontSize: 32,
      stroke: 0x000000,
      strokeThickness: 4,
      direction: diff > 0 ? 2 : 1,
    };
    tokens.forEach((token) => {
      if (!token.visible || token.document.isSecret) {
        return;
      }
      const scrollingTextArgs = [token.center, displayedDiff, displayArgs];
      canvas.interface.createScrollingText(...scrollingTextArgs);
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
   * Checks if there's a protection against something
   * @param {ProtectionDataKey} key - Category of protection
   * @param {ProtectionDataValue} value - Specific protection
   * @returns {boolean} Whether or not there's a protection against the specified key and value
   */
  isProtected(key, value) {
    let hasProtection = false;
    for (const protectionData of Object.values(this.protections)) {
      if (protectionData[key].has(value)) {
        hasProtection = true;
      }
    }
    return hasProtection;
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
    super.prepareBaseData();
    _baseData(this);
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    _prepareDerivedData(this);
  }

  /** @inheritDoc */
  prepareSpecialData() {
    super.prepareSpecialData();
    _prepareSpecialData(this);
  }
}
