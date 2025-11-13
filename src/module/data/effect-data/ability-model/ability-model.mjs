import { selectDialog } from "../../../applications/dialogs/select-dialog.mjs";
import { pseudoHooks } from "../../../constants/system/pseudo-hooks.mjs";
import { copyAbility } from "../../../helpers/fetch.mjs";
import { insertElderSorceryMask } from "../../../helpers/html.mjs";
import { mergeMetadata, safeUuid } from "../../../helpers/utils.mjs";
import {
  ConsumableDataMixin,
  HierarchyDataMixin,
  RevelationDataMixin,
  WikiDataMixin,
} from "../../mixins/_module.mjs";
import TeriockBaseEffectModel from "../base-effect-model/base-effect-model.mjs";
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
 * @extends {TeriockBaseEffectModel}
 * @mixes ConsumableData
 * @mixes HierarchyData
 * @mixes RevelationData
 * @mixes WikiData
 */
export default class TeriockAbilityModel extends RevelationDataMixin(
  HierarchyDataMixin(
    ConsumableDataMixin(WikiDataMixin(TeriockBaseEffectModel)),
  ),
) {
  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, {
    childEffectTypes: ["ability"],
    hierarchy: true,
    namespace: "Ability",
    type: "ability",
    usable: true,
    passive: true,
    indexCategoryKey: "abilities",
    indexCompendiumKey: "abilities",
    preservedProperties: [
      "system.adept",
      "system.consumable",
      "system.fluent",
      "system.gifted",
      "system.grantOnly",
      "system.hierarchy",
      "system.improvement",
      "system.limitation",
      "system.maxQuantity",
      "system.proficient",
      "system.quantity",
    ],
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

  /** @inheritDoc */
  get color() {
    return TERIOCK.options.ability.form[this.form].color;
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
        TERIOCK.options.ability.featSaveImprovementAmount[amount];
      return (
        `This ability gives you @L[Core:${amountVal} Bonus]{${amount}} in @L[Core:${att.toUpperCase()}] ` +
        "@L[Core:Feat Interaction]{feat saves}."
      );
    }
    return "";
  }

  /**
   * Gets the granting text.
   * @returns {string}
   */
  get grantOnlyText() {
    if (this.grantOnly) {
      return `This ability can only be used with @UUID[${this.parent.parent.uuid}].`;
    }
    return "";
  }

  /**
   * Whether this has an area of effect.
   * @returns {boolean}
   */
  get isAoe() {
    return (
      this.delivery.base === "aura" ||
      this.delivery.base === "cone" ||
      this.expansion === "detonate"
    );
  }

  /** @inheritDoc */
  get isUsable() {
    return super.usable && !this.isVirtual;
  }

  /**
   * Whether this is a virtual ability.
   * @returns {boolean}
   */
  get isVirtual() {
    return (
      this.parent.inCompendium && this.parent.parent.name === "Basic Abilities"
    );
  }

  /** @inheritDoc */
  get messageParts() {
    return {
      ...super.messageParts,
      ..._messageParts(this),
    };
  }

  /** @inheritDoc */
  get nameString() {
    const additions = [];
    if (this.adept.enabled) {
      additions.push("Adept");
    }
    if (this.gifted.enabled) {
      additions.push("Gifted");
    }
    if (this.limitation && this.limitation.length > 0) {
      additions.push("Limited");
    }
    if (this.improvement && this.improvement.length > 0) {
      additions.push("Improved");
    }
    if (this.grantOnly) {
      additions.push("Granted");
    }
    if (!this.revealed) {
      additions.push("Unrevealed");
    }
    let nameAddition = "";
    if (additions.length > 0) {
      nameAddition = ` (${additions.join(", ")})`;
    }
    return this.parent.name + nameAddition;
  }

  /** @inheritDoc */
  get suppressed() {
    let suppressed = super.suppressed;
    suppressed = suppressed || _suppressed(this);
    return suppressed;
  }

  //noinspection JSUnusedGlobalSymbols
  /**
   * String that represents all the valid targets.
   * @returns {string}
   */
  get targetString() {
    return Array.from(this.targets)
      .map((t) => TERIOCK.options.ability.targets[t])
      .sort((a, b) => a.localeCompare(b))
      .join(", ");
  }

  /** @inheritDoc */
  get useIcon() {
    if (this.interaction === "attack") {
      return "dice-d20";
    }
    if (this.interaction === "block") {
      return "shield";
    }
    return TERIOCK.options.document.ability.icon;
  }

  /** @inheritDoc */
  get useText() {
    if (this.spell) {
      return `Cast ${this.parent.name}`;
    }
    return super.useText;
  }

  /** @inheritDoc */
  adjustMessage(messageElement) {
    messageElement = super.adjustMessage(messageElement);
    messageElement = insertElderSorceryMask(messageElement, this.parent);
    return messageElement;
  }

  /**
   * Change a macro's run hook.
   * @param {Teriock.UUID<TeriockMacro>} uuid
   * @returns {Promise<void>}
   */
  async changeMacroRunHook(uuid) {
    const pseudoHook = await selectDialog(pseudoHooks, {
      label: "Event",
      hint: "Please select an event that triggers this macro to run.",
      title: "Select Event",
      initial: this.impacts.macros[safeUuid(uuid)],
    });
    const updateData = {};
    updateData[`system.impacts.macros.${safeUuid(uuid)}`] = pseudoHook;
    await this.parent.update(updateData);
  }

  /**
   * Cause all consequences this is sustaining to expire.
   * @param {boolean} force - Force consequences to expire even if this isn't suppressed.
   */
  async expireSustainedConsequences(force = false) {
    if (!this.parent.active || force) {
      const activeGM = game.users.activeGM;
      for (const uuid of this.sustaining) {
        await activeGM?.query("teriock.sustainedExpiration", {
          sustainedUuid: uuid,
        });
      }
      try {
        await this.parent.update({ "system.sustaining": new Set() });
      } catch {}
    }
  }

  /** @inheritDoc */
  async getIndexReference() {
    return await copyAbility(this.parent.name);
  }

  /**
   * @inheritDoc
   * @returns {Promise<object>}
   */
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

  /**
   * Unlink a macro.
   * @param {Teriock.UUID<TeriockMacro>} uuid
   * @returns {Promise<void>}
   */
  async unlinkMacro(uuid) {
    const updateData = {};
    updateData[`system.impacts.macros.-=${safeUuid(uuid)}`] = null;
    await this.parent.update(updateData);
  }
}
