import { dotJoin, prefix } from "../../../helpers/string.mjs";
import { makeIcon } from "../../../helpers/utils.mjs";
import { CommonTypeModel } from "../../models/_module.mjs";
import { _migrateData } from "./methods/_migrate-data.mjs";
import { _getRollData } from "./methods/_roll-data.mjs";
import { _baseData } from "./methods/base-data/_base-data.mjs";
import { _prepareDerivedData } from "./methods/derived-data/_derived-data.mjs";
import { _defineSchema } from "./methods/schema/_schema.mjs";
import { _prepareSpecialData } from "./methods/special-data/_special-data.mjs";
import ActorConditionTogglingPart from "./parts/actor-condition-toggling-part.mjs";
import ActorGenericRollsPart from "./parts/actor-generic-rolls-part.mjs";
import ActorHacksPart from "./parts/actor-hacks-part.mjs";
import ActorOneOffsPart from "./parts/actor-one-offs-part.mjs";
import ActorPayPart from "./parts/actor-pay-part.mjs";
import ActorRollableTakesPart from "./parts/actor-rollable-takes-part.mjs";

/**
 * Base {@link TeriockActor} data model.
 * @mixes CommonTypeModel
 * @mixes ActorConditionTogglingPart
 * @mixes ActorGenericRollsPart
 * @mixes ActorHacksPart
 * @mixes ActorOneOffsPart
 * @mixes ActorPayPart
 * @mixes ActorRollableTakesPart
 * @property {Partial<LightData>} light
 */
export default class TeriockBaseActorModel extends ActorConditionTogglingPart(
  ActorRollableTakesPart(
    ActorPayPart(
      ActorOneOffsPart(ActorHacksPart(ActorGenericRollsPart(CommonTypeModel))),
    ),
  ),
) {
  /** @inheritDoc */
  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
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
        "power",
        "rank",
        "species",
        "mount",
      ],
      childMacroTypes: [],
      visibleTypes: ["power", "rank", "species"],
    });
  }

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

  /** @inheritDoc */
  getCardContextMenuEntries(doc) {
    return [
      {
        name: "Open Token",
        icon: makeIcon("user-circle", "contextMenu"),
        condition: () => this.parent.token && this.parent.token.isViewer,
        callback: async () => this.parent.token.sheet.render(true),
      },
      ...super.getCardContextMenuEntries(doc),
    ];
  }

  /** @inheritDoc */
  get displayToggles() {
    return [...super.displayToggles, "disabled"];
  }

  /** @inheritDoc */
  get embedParts() {
    const parts = super.embedParts;
    parts.subtitle = this.metadata.type;
    parts.text = dotJoin([
      prefix(this.scaling.lvl, "LVL"),
      prefix(this.scaling.br, "BR"),
      prefix(this.size.number.value, "Size"),
    ]);
    parts.makeTooltip = this.parent.isViewer;
    return parts;
  }

  /**
   * Whether this actor is transformed.
   * @returns {boolean}
   */
  get isTransformed() {
    return Boolean(
      this.transformation.effect && this.transformation.effect.active,
    );
  }

  /** @inheritDoc */
  get panelParts() {
    const parts = super.panelParts;
    parts.blocks = [
      {
        title: "Notes",
        text: this.sheet.notes,
      },
    ];
    return parts;
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
    // The large number catch is used to keep from rendering the stat change upon applying transformations
    if (options.teriock.mpChange !== 0 && options.teriock.mpChange < 999999) {
      const color = options.teriock.mpChange > 0 ? "#99C1F1" : "#1A5FB4";
      this.animateStatChangeEffect(options.teriock.mpChange, color).then();
    }
    if (options.teriock.hpChange !== 0 && options.teriock.hpChange < 999999) {
      const color = options.teriock.hpChange > 0 ? "#F66151" : "#A51D2D";
      this.animateStatChangeEffect(options.teriock.hpChange, color).then();
    }
    if (
      options.teriock.witherChange !== 0 &&
      options.teriock.witherChange < 999999
    ) {
      const color = options.teriock.witherChange > 0 ? "#241F31" : "#5E5C64";
      this.animateStatChangeEffect(options.teriock.witherChange, color).then();
    }
  }

  /** @inheritDoc */
  async _preCreate(data, options, user) {
    if ((await super._preCreate(data, options, user)) === false) {
      return false;
    }
    this.parent.updateSource({
      prototypeToken: {
        bar1: {
          attribute: "hp",
        },
        bar2: {
          attribute: "mp",
        },
        displayBars: 20,
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

  /** @inheritDoc */
  getRollData() {
    return _getRollData(this);
  }

  /**
   * Checks if there's some protection against something
   * @param {ProtectionDataKey} key - Category of protection
   * @param {ProtectionDataValue} value - Specific protection
   * @returns {boolean} Whether or not there's some protection against the specified key and value
   */
  isProtected(key, value) {
    let hasProtection = false;
    for (const protectionData of Object.values(this.protections)) {
      if ((protectionData[key] || new Set()).has(value)) {
        hasProtection = true;
      }
    }
    return hasProtection;
  }

  /**
   * Performs post-update operations for the actor.
   * @returns {Promise<void>}
   */
  async postUpdate() {
    for (const effect of this.parent.conditionExpirationEffects) {
      await effect.system.checkExpiration();
    }
    for (const token of this.parent.getDependentTokens()) {
      await token.postActorUpdate();
    }
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
