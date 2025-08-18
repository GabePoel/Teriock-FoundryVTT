import { insertElderSorceryMask } from "../../../helpers/html.mjs";
import { ConsumableDataMixin, WikiDataMixin } from "../../mixins/_module.mjs";
import TeriockBaseEffectData from "../base-effect-data/base-effect-data.mjs";
import { _generateChanges } from "./methods/_generate-changes.mjs";
import { _messageParts } from "./methods/_messages.mjs";
import { _migrateData } from "./methods/_migrate-data.mjs";
import { _parse } from "./methods/_parsing.mjs";
import { _suppressed } from "./methods/_suppression.mjs";
import { _prepareDerivedData } from "./methods/data-deriving/_data-deriving.mjs";
import { _roll } from "./methods/rolling/_rolling.mjs";
import { _defineSchema } from "./methods/schema/_schema.mjs";

/**
 * Ability-specific effect data model.
 *
 * Relevant wiki pages:
 * - [Ability Rules](https://wiki.teriock.com/index.php/Category:Ability_rules)
 *
 * @extends {TeriockBaseEffectData}
 * @mixes ConsumableDataMixin
 * @mixes WikiDataMixin
 */
export default class TeriockAbilityData extends WikiDataMixin(
  ConsumableDataMixin(TeriockBaseEffectData),
) {
  /**
   * Metadata for this effect.
   * @type {Readonly<Teriock.Documents.EffectModelMetadata>}
   */
  static metadata = Object.freeze({
    consumable: false,
    hierarchy: true,
    namespace: "Ability",
    pageNameKey: "name",
    type: "ability",
    usable: true,
    wiki: true,
  });

  /** @inheritDoc */
  static defineSchema() {
    const schema = super.defineSchema();
    Object.assign(schema, _defineSchema());
    return schema;
  }

  /** @inheritDoc */
  static migrateData(data) {
    data = _migrateData(data);
    return super.migrateData(data);
  }

  /**
   * Gets this ability's attribute improvement text.
   * @returns {string}
   */
  get attributeImprovementText() {
    if (this.improvements.attributeImprovement.attribute) {
      const att = this.improvements.attributeImprovement.attribute;
      const minVal = this.improvements.attributeImprovement.minVal;
      return `This ability sets your @L[Core:${att.toUpperCase()}] score to a minimum of ${minVal}.`;
    }
    return "";
  }

  /**
   * Gets the changes this ability would provide.
   * @returns {EffectChangeData[]}
   */
  get changes() {
    return _generateChanges(this);
  }

  /**
   * Gets this ability's feat save improvement text.
   * @returns {string}
   */
  get featSaveImprovementText() {
    if (this.improvements.featSaveImprovement.attribute) {
      const att = this.improvements.featSaveImprovement.attribute;
      const amount = this.improvements.featSaveImprovement.amount;
      const amountVal =
        CONFIG.TERIOCK.abilityOptions.featSaveImprovementAmount[amount];
      return `This ability gives you @L[Core:${amountVal} Bonus]{${amount}} in @L[Core:${att.toUpperCase()}] @L[Core:Feat Interaction]{feat saves}.`;
    }
    return "";
  }

  /** @inheritDoc */
  get messageParts() {
    return {
      ...super.messageParts,
      ..._messageParts(this),
    };
  }

  /** @inheritDoc */
  get suppressed() {
    let suppressed = super.suppressed;
    suppressed = suppressed || _suppressed(this);
    return suppressed;
  }

  /** @inheritDoc */
  get useIcon() {
    if (this.interaction === "attack") return "dice-d20";
    if (this.interaction === "block") return "shield";
    return CONFIG.TERIOCK.documentOptions.ability.icon;
  }

  /** @inheritDoc */
  get useText() {
    if (this.spell) return `Cast ${this.parent.name}`;
    return super.useText;
  }

  /** @inheritDoc */
  adjustMessage(messageElement) {
    messageElement = super.adjustMessage(messageElement);
    messageElement = insertElderSorceryMask(messageElement, this.parent);
    return messageElement;
  }

  /**
   * Cause all consequences this is sustaining to expire.
   * @param {boolean} force - Force consequences to expire even if this isn't suppressed.
   */
  async expireSustainedConsequences(force = false) {
    if (this.parent.isSuppressed || this.parent.disabled || force) {
      const activeGm = /** @type {TeriockUser} */ game.users.activeGM;
      for (const uuid of this.sustaining) {
        await activeGm.query("teriock.sustainedExpiration", {
          sustainedUuid: uuid,
        });
      }
      try {
        await this.parent.update({ "system.sustaining": new Set() });
      } catch {}
    }
  }

  /** @inheritDoc */
  async parse(rawHTML) {
    return await _parse(this, rawHTML);
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    _prepareDerivedData(this);
  }

  /**
   * @inheritDoc
   * @param {Teriock.RollOptions.CommonRoll} options
   */
  async roll(options) {
    return await _roll(this, options);
  }
}
