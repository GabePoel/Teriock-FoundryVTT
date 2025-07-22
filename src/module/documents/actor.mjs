import { rankOptions } from "../helpers/constants/rank-options.mjs";
import { toCamelCase } from "../helpers/utils.mjs";
import { BaseTeriockActor } from "./_base.mjs";
import TeriockRoll from "./roll.mjs";

/**
 * @property {TeriockBaseActorData} system
 * @property {TeriockBaseActorSheet} sheet
 */
export default class TeriockActor extends BaseTeriockActor {
  /**
   * Gets the valid effects for this actor.
   *
   * @returns {TeriockEffect[]} Array of transferred effects.
   */
  get validEffects() {
    return Array.from(this.allApplicableEffects());
  }

  /**
   * Gets effects that expire based on conditions.
   *
   * @returns {TeriockEffect[]} Array of condition expiration effects.
   */
  get conditionExpirationEffects() {
    return this.effectTypes.effect?.filter((effect) => effect.system.conditionExpiration) || [];
  }

  /**
   * Gets effects that expire based on movement.
   *
   * @returns {TeriockEffect[]} Array of movement expiration effects.
   */
  get movementExpirationEffects() {
    return this.effectTypes.effect?.filter((effect) => effect.system.movementExpiration) || [];
  }

  /**
   * Gets effects that expire at dawn.
   *
   * @returns {TeriockEffect[]} Array of dawn expiration effects.
   */
  get dawnExpirationEffects() {
    return this.effectTypes.effect?.filter((effect) => effect.system.dawnExpiration) || [];
  }

  /**
   * Gets effects that expire when sustained abilities end.
   *
   * @returns {TeriockEffect[]} Array of sustained expiration effects.
   */
  get sustainedExpirationEffects() {
    return this.effectTypes.effect?.filter((effect) => effect.system.sustainedExpiration) || [];
  }

  /**
   * Checks if the actor is disabled (dead).
   *
   * @returns {boolean} True if the actor is dead, false otherwise.
   */
  get disabled() {
    return this.statuses.has("dead");
  }

  /**
   * Pre-process a creation operation, potentially altering its instructions or input data. Pre-operation events only
   * occur for the client which requested the operation.
   *
   * This batch-wise workflow occurs after individual {@link _preCreate} workflows and provides a final pre-flight check
   * before a database operation occurs.
   *
   * Modifications to pending documents must mutate the documents array or alter individual document instances using
   * {@link updateSource}.
   *
   * @param {TeriockActor[]} documents - Pending document instances to be created
   * @param {DatabaseCreateOperation} operation - Parameters of the database creation operation
   * @param {BaseUser} user - The User requesting the creation operation
   * @returns {Promise<boolean|void>} - Return false to cancel the creation operation entirely
   * @protected
   */
  static async _preCreateOperation(documents, operation, user) {
    await super._preCreateOperation(documents, operation, user);
    /** @type {CompendiumPacks} */
    const packs = game.packs;
    const essentialPack = packs.get("teriock.essentials");
    const basicAbilities = await foundry.utils.fromUuid(essentialPack.index.getName("Basic Abilities").uuid);
    const createdElderSorceries = await foundry.utils.fromUuid(
      essentialPack.index.getName("Created Elder Sorceries").uuid,
    );
    const learnedElderSorceries = await foundry.utils.fromUuid(
      essentialPack.index.getName("Learned Elder Sorceries").uuid,
    );
    const classPack = packs.get("teriock.classes");
    const journeyman = await foundry.utils.fromUuid(classPack.index.getName("Journeyman").uuid);
    const equipmentPack = packs.get("teriock.equipment");
    const foot = await foundry.utils.fromUuid(equipmentPack.index.getName("Foot").uuid);
    const hand = await foundry.utils.fromUuid(equipmentPack.index.getName("Hand").uuid);
    const mouth = await foundry.utils.fromUuid(equipmentPack.index.getName("Mouth").uuid);
    const speciesPack = packs.get("teriock.species");
    const human = await foundry.utils.fromUuid(speciesPack.index.getName("Human").uuid);
    for (const actor of documents) {
      actor.updateSource({
        items: [
          basicAbilities.toObject(),
          createdElderSorceries.toObject(),
          learnedElderSorceries.toObject(),
          journeyman.toObject(),
          foot.toObject(),
          hand.toObject(),
          mouth.toObject(),
          human.toObject(),
        ],
      });
    }
  }

  /**
   * Prepares derived data for the document, including effect types and keys.
   *
   * @inheritdoc
   */
  prepareDerivedData() {
    super.prepareDerivedData();
    this.itemKeys = {
      equipment: new Set(this.itemTypes?.equipment.map((e) => toCamelCase(e.name))),
      power: new Set(this.itemTypes?.power.map((e) => toCamelCase(e.name))),
      rank: new Set(this.itemTypes?.rank.map((e) => toCamelCase(e.name))),
    };
  }

  /**
   * Create multiple embedded Document instances within this parent Document using provided input data.
   * Overridden with special handling to allow for archetype abilities.
   *
   * @see {@link Document.createDocuments}
   * @param {string} embeddedName - The name of the embedded Document type
   * @param {object[]} data - An array of data objects used to create multiple documents
   * @param {DatabaseCreateOperation} [operation={}] - Parameters of the database creation workflow
   * @returns {Promise<Document[]>} - An array of created Document instances
   */
  async createEmbeddedDocuments(embeddedName, data = [], operation = {}) {
    /** @type {CompendiumPacks} */
    const packs = game.packs;
    const classPack = packs.get("teriock.classes");
    if (embeddedName === "Item" && data.find((d) => d.type === "rank" && d.system?.archetype === "mage")) {
      if (!this.itemKeys?.power.has("mage")) {
        const mage = await foundry.utils.fromUuid(classPack.index.getName("Mage").uuid);
        data.push(mage.toObject());
      }
    }
    if (embeddedName === "Item" && data.find((d) => d.type === "rank" && d.system?.archetype === "semi")) {
      if (!this.itemKeys?.power.has("semi")) {
        const semi = await foundry.utils.fromUuid(classPack.index.getName("Semi").uuid);
        data.push(semi.toObject());
      }
    }
    if (embeddedName === "Item" && data.find((d) => d.type === "rank" && d.system?.archetype === "warrior")) {
      if (!this.itemKeys?.power.has("warrior")) {
        const warrior = await foundry.utils.fromUuid(classPack.index.getName("Warrior").uuid);
        data.push(warrior.toObject());
      }
    }
    return await super.createEmbeddedDocuments(embeddedName, data, operation);
  }

  /**
   * Delete multiple embedded Document instances within a parent Document using provided string ids.
   * Overridden with special handling to allow for archetype abilities.
   *
   * @see {@link Document.deleteDocuments}
   * @param {string} embeddedName - The name of the embedded Document type
   * @param {string[]} ids - An array of string ids for each Document to be deleted
   * @param {DatabaseDeleteOperation} [operation={}] - Parameters of the database deletion workflow
   * @returns {Promise<Document[]>} - An array of deleted Document instances
   */
  async deleteEmbeddedDocuments(embeddedName, ids = [], operation = {}) {
    if (embeddedName === "Item") {
      const ranksBeingDeleted = this.itemTypes?.rank?.filter((i) => ids.includes(i.id)) ?? [];
      const archetypesDeleted = new Set(ranksBeingDeleted.map((i) => i.system?.archetype).filter(Boolean));
      for (const archetype of ["mage", "semi", "warrior"]) {
        if (!archetypesDeleted.has(archetype)) continue;
        const remaining = this.itemTypes?.rank?.some((i) => i.system?.archetype === archetype && !ids.includes(i.id));
        if (!remaining) {
          const powerName = rankOptions[archetype].name;
          const powerItem = this.itemTypes?.power?.find((i) => i.name === powerName);
          if (powerItem && !ids.includes(powerItem.id)) ids.push(powerItem.id);
        }
      }
    }
    return await super.deleteEmbeddedDocuments("Item", ids, operation);
  }

  /**
   * Gets roll data for this actor, delegating to the system's getRollData method.
   *
   * @returns {object} The roll data for this actor.
   * @inheritdoc
   */
  getRollData() {
    return this.system.getRollData();
  }

  /**
   * Performs post-update operations for the actor.
   *
   * @param {Teriock.SkipFunctions} skipFunctions - Functions that should be skipped.
   * @returns {Promise<void>} Resolves when all post-update operations are complete
   * @returns {Promise<void>} Promise that resolves when post-update is complete.
   */
  async postUpdate(skipFunctions = {}) {
    await this.system.postUpdate(skipFunctions);
  }

  /**
   * Applies damage to the actor's hit points.
   *
   * Relevant wiki pages:
   * - [Damage](https://wiki.teriock.com/index.php/Core:Damage)
   *
   * @param {number} amount - The amount of damage to apply.
   * @returns {Promise<void>} Promise that resolves when damage is applied.
   */
  async takeDamage(amount) {
    await this.system.takeDamage(amount);
  }

  /**
   * Applies drain to the actor's mana points.
   *
   * Relevant wiki pages:
   * - [Mana Drain](https://wiki.teriock.com/index.php/Drain:Mana)
   *
   * @param {number} amount - The amount of drain to apply.
   * @returns {Promise<void>} Promise that resolves when drain is applied.
   */
  async takeDrain(amount) {
    await this.system.takeDrain(amount);
  }

  /**
   * Applies wither to the actor's hit points.
   *
   * Relevant wiki pages:
   * - [Wither](https://wiki.teriock.com/index.php/Drain:Wither)
   *
   * @param {number} amount - The amount of wither to apply.
   * @returns {Promise<void>} Promise that resolves when wither is applied.
   */
  async takeWither(amount) {
    await this.system.takeWither(amount);
  }

  /**
   * Applies healing to the actor's hit points.
   *
   * Relevant wiki pages:
   * - [Healing](https://wiki.teriock.com/index.php/Core:Healing)
   *
   * @param {number} amount - The amount of healing to apply.
   * @returns {Promise<void>} Promise that resolves when healing is applied.
   */
  async takeHeal(amount) {
    await this.system.takeHeal(amount);
  }

  /**
   * Applies revitalization to the actor's mana points.
   *
   * Relevant wiki pages:
   * - [Revitalizing](https://wiki.teriock.com/index.php/Core:Revitalizing)
   *
   * @param {number} amount - The amount of revitalization to apply.
   * @returns {Promise<void>} Promise that resolves when revitalization is applied.
   */
  async takeRevitalize(amount) {
    await this.system.takeRevitalize(amount);
  }

  /**
   * Sets the actor's temporary hit points to a specific amount.
   *
   * Relevant wiki pages:
   * - [Temporary Hit Points](https://wiki.teriock.com/index.php/Core:Temporary_Hit_Points)
   *
   * @param {number} amount - The amount to set temporary hit points to.
   * @returns {Promise<void>} Promise that resolves when temporary hit points are set.
   */
  async takeSetTempHp(amount) {
    await this.system.takeSetTempHp(amount);
  }

  /**
   * Sets the actor's temporary mana points to a specific amount.
   *
   * Relevant wiki pages:
   * - [Temporary Mana Points](https://wiki.teriock.com/index.php/Core:Temporary_Mana_Points)
   *
   * @param {number} amount - The amount to set temporary mana points to.
   * @returns {Promise<void>} Promise that resolves when temporary mana points are set.
   */
  async takeSetTempMp(amount) {
    await this.system.takeSetTempMp(amount);
  }

  /**
   * Gains temporary hit points for the actor.
   *
   * Relevant wiki pages:
   * - [Temporary Hit Points](https://wiki.teriock.com/index.php/Core:Temporary_Hit_Points)
   *
   * @param {number} amount - The amount of temporary hit points to gain.
   * @returns {Promise<void>} Promise that resolves when temporary hit points are gained.
   */
  async takeGainTempHp(amount) {
    await this.system.takeGainTempHp(amount);
  }

  /**
   * Gains temporary mana points for the actor.
   *
   * Relevant wiki pages:
   * - [Temporary Mana Points](https://wiki.teriock.com/index.php/Core:Temporary_Mana_Points)
   *
   * @param {number} amount - The amount of temporary mana points to gain.
   * @returns {Promise<void>} Promise that resolves when temporary mana points are gained.
   */
  async takeGainTempMp(amount) {
    await this.system.takeGainTempMp(amount);
  }

  /**
   * Applies sleep to the actor.
   *
   * Relevant wiki pages:
   * - [Swift Sleep Aura](https://wiki.teriock.com/index.php/Ability:Swift_Sleep_Aura)
   *
   * @param {number} amount - The amount of sleep to apply.
   * @returns {Promise<void>} Promise that resolves when sleep is applied.
   */
  async takeSleep(amount) {
    await this.system.takeSleep(amount);
  }

  /**
   * Applies kill effect to the actor.
   *
   * Relevant wiki pages:
   * - [Death Ray](https://wiki.teriock.com/index.php/Ability:Death_Ray)
   *
   * @param {number} amount - The amount of kill effect to apply.
   * @returns {Promise<void>} Promise that resolves when kill effect is applied.
   */
  async takeKill(amount) {
    await this.system.takeKill(amount);
  }

  /**
   * Actor pays money.
   *
   * @param {number} amount - The amount of gold-equivalent money to pay.
   * @param {"exact" | "greedy"} mode - Exact change or closest denomination, rounded up.
   */
  async takePay(amount, mode = "greedy") {
    await this.system.takePay(amount, mode);
  }

  /**
   * Applies hack effect to a specific part of the actor.
   *
   * Relevant wiki pages:
   * - [Hack](https://wiki.teriock.com/index.php/Damage:Hack)
   *
   * @param {Teriock.HackableBodyPart} part - The part to hack.
   * @returns {Promise<void>} Promise that resolves when hack is applied.
   */
  async takeHack(part) {
    await this.system.takeHack(part);
  }

  /**
   * Removes hack effect from a specific part of the actor.
   *
   * Relevant wiki pages:
   * - [Hack](https://wiki.teriock.com/index.php/Damage:Hack)
   *
   * @param {Teriock.HackableBodyPart} part - The part to unhack.
   * @returns {Promise<void>} Promise that resolves when unhack is applied.
   */
  async takeUnhack(part) {
    await this.system.takeUnhack(part);
  }

  /**
   * Awakens the actor from sleep.
   *
   * Relevant wiki pages:
   * - [Awaken](https://wiki.teriock.com/index.php/Keyword:Awaken)
   *
   * @returns {Promise<void>} Promise that resolves when the actor is awakened.
   */
  async takeAwaken() {
    await this.system.takeAwaken();
  }

  /**
   * Revives the actor from death.
   *
   * Relevant wiki pages:
   * - [Revival Effects](https://wiki.teriock.com/index.php/Category:Revival_effects)
   *
   * @returns {Promise<void>} Promise that resolves when the actor is revived.
   */
  async takeRevive() {
    await this.system.takeRevive();
  }

  /**
   * Rolls a condition check for the actor.
   *
   * Relevant wiki pages:
   * - [Conditions](https://wiki.teriock.com/index.php/Category:Conditions)
   *
   * @param {string} condition - The condition to roll for.
   * @param {Teriock.ConditionRollOptions} options - Options for the condition roll.
   * @returns {Promise<void>} Promise that resolves when the condition roll is complete.
   */
  async rollCondition(condition, options) {
    await this.system.rollCondition(condition, options);
  }

  /**
   * Rolls a feat save for the specified attribute.
   *
   * Relevant wiki pages:
   * - [Feat Interaction](https://wiki.teriock.com/index.php/Core:Feat_Interaction)
   *
   * @param {string} attribute - The attribute to roll a feat save for.
   * @param {Teriock.CommonRollOptions} [options] - Options for the roll.
   * @returns {Promise<void>}
   */
  async rollFeatSave(attribute, options = {}) {
    await this.system.rollFeatSave(attribute, options);
  }

  /**
   * Rolls a resistance save.
   *
   * Relevant wiki pages:
   * - [Resistance](https://wiki.teriock.com/index.php/Ability:Resist_Effects)
   *
   * @param {Teriock.CommonRollOptions} [options] - Options for the roll.
   * @returns {Promise<void>}
   */
  async rollResistance(options = {}) {
    await this.system.rollResistance(options);
  }

  /**
   * Rolls an immunity save (these always succeed).
   *
   * Relevant wiki pages:
   * - [Immunity](https://wiki.teriock.com/index.php/Keyword:Immunity)
   *
   * @param {Teriock.CommonRollOptions} [options] - Options for the roll.
   * @returns {Promise<void>}
   */
  async rollImmunity(options = {}) {
    await this.system.rollImmunity(options);
  }

  /**
   * Rolls a tradecraft check.
   *
   * Relevant wiki pages:
   * - [Tradecrafts](https://wiki.teriock.com/index.php/Core:Tradecrafts)
   *
   * @param {string} tradecraft - The tradecraft to roll for.
   * @param {Teriock.CommonRollOptions} [options] - Options for the roll.
   * @returns {Promise<void>}
   */
  async rollTradecraft(tradecraft, options = {}) {
    await this.system.rollTradecraft(tradecraft, options);
  }

  /**
   * Uses an ability by name.
   *
   * @param {string} abilityName - The name of the ability to use.
   * @param {Teriock.CommonRollOptions} [options] - Options for using the ability.
   * @returns {Promise<void>}
   */
  async useAbility(abilityName, options = {}) {
    const abilities = Array.from(this.allApplicableEffects()).filter((i) => i.type === "ability");
    /** @type TeriockAbility */
    const ability = abilities.find((i) => i.name === abilityName);
    if (ability) {
      await ability.use(options);
    } else {
      ui.notifications.warn(`${this.name} does not have ${abilityName}.`);
    }
  }

  /**
   * Ends a condition with an optional roll.
   *
   * @todo Convert to using `ConditionRollOptions` type.
   * @param {Teriock.CommonRollOptions} options - Options for ending the condition.
   * @returns {Promise<void>}
   */
  async endCondition(options = {}) {
    let message = null;
    if (options.message) {
      message = options.message;
    }
    let rollFormula = "2d4";
    if (options.advantage) {
      rollFormula = "3d4";
    } else if (options.disadvantage) {
      rollFormula = "1d4";
    }
    rollFormula += "kh1";
    const rollData = this.getRollData();
    const roll = new TeriockRoll(rollFormula, rollData, {
      message: message,
      context: {
        diceClass: "condition",
        threshold: 4,
      },
    });
    await roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this }),
      flavor: "Condition Ending Roll",
    });
  }
}
