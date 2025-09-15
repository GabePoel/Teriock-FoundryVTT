import { TeriockRoll } from "../dice/_module.mjs";
import { copyItem } from "../helpers/fetch.mjs";
import { toCamelCase } from "../helpers/string.mjs";
import { pureUuid } from "../helpers/utils.mjs";
import { CommonDocumentMixin, ParentDocumentMixin } from "./mixins/_module.mjs";

const { Actor } = foundry.documents;

// noinspection JSClosureCompilerSyntax
/**
 * The Teriock {@link Actor} implementation.
 * @extends {Actor}
 * @mixes ClientDocumentMixin
 * @mixes CommonDocumentMixin
 * @mixes ParentDocumentMixin
 * @property {"Actor"} documentName
 * @property {Collection<Teriock.UUID<TeriockEffect>, TeriockEffect>} effects
 * @property {Collection<Teriock.UUID<TeriockItem>, TeriockItem>} items
 * @property {ParentItemKeys} itemKeys
 * @property {ParentItemTypes} itemTypes
 * @property {Set<Teriock.Parameters.Condition.ConditionKey>} statuses
 * @property {Teriock.Documents.ActorType} type
 * @property {Teriock.UUID<TeriockActor>} uuid
 * @property {TeriockBaseActorModel} system
 * @property {TeriockBaseActorSheet} sheet
 * @property {TeriockEffect[]} appliedEffects
 * @property {TeriockEffect[]} temporaryEffects
 * @property {boolean} isOwner
 * @property {boolean} limited
 */
export default class TeriockActor extends ParentDocumentMixin(CommonDocumentMixin(Actor)) {
  /**
   * Figure out the name for a given size.
   * @param {number} size
   * @returns {string}
   */
  static toNamedSize(size) {
    const sizeKeys = Object.keys(TERIOCK.options.character.namedSizes).map(Number);
    const filteredSizeKeys = sizeKeys.filter((key) => key <= size);
    const sizeKey = Math.max(...filteredSizeKeys, 0);
    return TERIOCK.options.character.namedSizes[sizeKey] || "Medium";
  }

  /**
   * @inheritDoc
   * @returns {TeriockActor}
   */
  get actor() {
    return this;
  }

  /**
   * Gets effects that expire based on conditions.
   * @returns {TeriockConsequence[]} Array of condition expiration effects.
   */
  get conditionExpirationEffects() {
    return (this.consequences.filter((effect) => effect.system.conditionExpiration) || []);
  }

  /**
   * Gets effects that expire at dawn.
   * @returns {TeriockConsequence[]} Array of dawn expiration effects.
   */
  get dawnExpirationEffects() {
    return (this.consequences.filter((effect) => effect.system.dawnExpiration) || []);
  }

  /**
   * Checks if the actor is disabled (dead).
   * @returns {boolean} True if the actor is dead, false otherwise.
   */
  get disabled() {
    return this.statuses.has("dead");
  }

  /**
   * Get effects that expire with some duration.
   * @returns {TeriockConsequence[]}
   */
  get durationExpirationEffects() {
    return this.consequences.filter((effect) => effect.hasDuration);
  }

  /** @returns {TeriockEquipment[]} */
  get equipment() {
    return this.itemTypes?.equipment || [];
  }

  /**
   * Is this actor damaged?
   * @returns {boolean}
   */
  get isDamaged() {
    return this.system.hp.value < this.system.hp.max || this.statuses.has("hacked");
  }

  /**
   * Is this actor drained?
   * @returns {boolean}
   */
  get isDrained() {
    return this.system.mp.value < this.system.mp.max;
  }

  /**
   * @inheritDoc
   * @returns {Readonly<Teriock.Documents.ActorModelMetadata>}
   */
  get metadata() {
    return /** @type {Readonly<Teriock.Documents.ActorModelMetadata>} */ super.metadata;
  }

  /**
   * Gets effects that expire based on movement.
   * @returns {TeriockConsequence[]} Array of movement expiration effects.
   */
  get movementExpirationEffects() {
    return (this.consequences.filter((effect) => effect.system.movementExpiration) || []);
  }

  /** @returns {TeriockPower[]} */
  get powers() {
    return this.itemTypes?.power || [];
  }

  /** @returns {TeriockRank[]} */
  get ranks() {
    return this.itemTypes?.rank || [];
  }

  /** @returns {TeriockSpecies[]} */
  get species() {
    return this.itemTypes?.species || [];
  }

  /**
   * @inheritDoc
   * @returns {TeriockEffect[]}
   */
  get validEffects() {
    return Array.from(this.allApplicableEffects());
  }

  /**
   * @inheritDoc
   * @param {ActorData} data
   * @param {object} options
   * @param {TeriockUser} user
   * @returns {Promise<boolean|void>}
   */
  async _preCreate(data, options, user) {
    super._preCreate(data, options, user);

    // Add Essential Items
    this.updateSource({
      items: [
        (await copyItem("Basic Abilities", "essentials")).toObject(),
        (await copyItem("Created Elder Sorceries", "essentials")).toObject(),
        (await copyItem("Learned Elder Sorceries", "essentials")).toObject(),
        (await copyItem("Journeyman", "classes")).toObject(),
        (await copyItem("Foot", "equipment")).toObject(),
        (await copyItem("Hand", "equipment")).toObject(),
        (await copyItem("Mouth", "equipment")).toObject(),
        (await copyItem("Actor Mechanics", "essentials")).toObject(),
      ],
    });

    // Update Prototype Token
    const prototypeToken = {};
    const size = TERIOCK.options.character.tokenSizes[TeriockActor.toNamedSize(this.system.size)] || 1;
    if (!foundry.utils.hasProperty(data, "prototypeToken.sight.enabled")) {
      prototypeToken.sight = {
        enabled: true,
        range: 0,
      };
    }
    if (!foundry.utils.hasProperty(data, "prototypeToken.width")) {
      prototypeToken.width = size;
    }
    if (!foundry.utils.hasProperty(data, "prototypeToken.height")) {
      prototypeToken.height = size;
    }
    this.updateSource({ prototypeToken: prototypeToken });
  }

  /**
   * @inheritDoc
   * @param {object} changed
   * @param {object} options
   * @param {TeriockUser} user
   * @returns {Promise<boolean|void>}
   */
  async _preUpdate(changed, options, user) {
    if ((await super._preUpdate(changed, options, user)) === false) {
      return false;
    }
    if (foundry.utils.hasProperty(changed, "system.size")) {
      const tokenSize = TERIOCK.options.character.tokenSizes[TeriockActor.toNamedSize(changed.system.size)] || 1;
      if (!foundry.utils.hasProperty(changed, "prototypeToken.width")) {
        changed.prototypeToken ||= {};
        changed.prototypeToken.height = tokenSize;
        changed.prototypeToken.width = tokenSize;
      }
      for (const token of /** @type {TeriockTokenDocument[]} */ this.getDependentTokens()) {
        if (token.parent?.grid?.type === 0) {
          await token.resize({
            width: tokenSize,
            height: tokenSize,
          });
        } else {
          await token.update({
            width: tokenSize,
            height: tokenSize,
          });
        }
      }
    }
  }

  /**
   * @inheritDoc
   * @yields {TeriockEffect}
   * @returns {Generator<TeriockEffect, void, void>}
   */
  * allApplicableEffects() {
    for (const effect of super.allApplicableEffects()) {
      if (effect.system.modifies !== this.documentName) {
        continue;
      }
      yield effect;
    }
  }

  /**
   * @inheritDoc
   * @param {"Item"|"ActiveEffect"} embeddedName
   * @param {object[]} data
   * @param {DatabaseCreateOperation} [operation={}]
   * @returns {Promise<TeriockChild[]>}
   */
  async createEmbeddedDocuments(embeddedName, data = [], operation = {}) {
    this._filterDocumentCreationData(embeddedName, data);
    if (embeddedName === "Item") {
      for (const archetype of [
        "mage",
        "semi",
        "warrior",
      ]) {
        if (data.find((d) => d.type === "rank" && d.system?.archetype === archetype)) {
          if (!this.itemKeys.power.has(archetype)) {
            data.push(await copyItem(TERIOCK.options.rank[archetype].name, "classes"));
          }
        }
      }
    }
    if (embeddedName === "ActiveEffect" && data.find((d) => d.type === "consequence")) {
      for (const consequenceData of data.filter((d) => d.type === "consequence")) {
        const changes = consequenceData?.changes;
        if (changes && changes.length > 0) {
          for (const change of changes) {
            if (change.key === "system.hookedMacros.effectApplication") {
              const uuid = pureUuid(change.value);
              /** @type {TeriockMacro|null} */
              const macro = await foundry.utils.fromUuid(uuid);
              if (macro) {
                await macro.execute({
                  actor: this,
                  data: {
                    cancel: false,
                    docData: consequenceData,
                  },
                });
              }
            }
          }
        }
      }
    }
    return await super.createEmbeddedDocuments(embeddedName, data, operation);
  }

  /**
   * Overridden with special handling to allow for archetype abilities.
   * @inheritDoc
   * @template T
   * @param {"Item"|"ActiveEffect"} embeddedName - The name of the embedded Document type
   * @param {Teriock.ID<T>[]} ids - An array of string ids for each Document to be deleted
   * @param {DatabaseDeleteOperation} [operation={}] - Parameters of the database deletion workflow
   * @returns {Promise<T[]>} - An array of deleted Document instances
   */
  async deleteEmbeddedDocuments(embeddedName, ids = [], operation = {}) {
    if (embeddedName === "Item") {
      const ranksBeingDeleted = this.ranks.filter((i) => ids.includes(i.id)) ?? [];
      const archetypesDeleted = new Set(ranksBeingDeleted.map((i) => i.system.archetype).filter(Boolean));
      for (const archetype of [
        "mage",
        "semi",
        "warrior",
      ]) {
        if (!archetypesDeleted.has(archetype)) {
          continue;
        }
        const remaining = this.ranks.some((i) => i.system.archetype === archetype && !ids.includes(i.id));
        if (!remaining) {
          const powerName = TERIOCK.options.rank[archetype].name;
          const powerItem = this.powers.find((i) => i.name === powerName);
          if (powerItem && !ids.includes(powerItem.id)) {
            ids.push(powerItem.id);
          }
        }
      }
    }
    return await super.deleteEmbeddedDocuments(embeddedName, ids, operation);
  }

  /**
   * Ends a condition with an optional roll.
   * @todo Convert to using `ConditionRollOptions` type.
   * @param {Teriock.RollOptions.CommonRoll} options - Options for ending the condition.
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
      context: {
        diceClass: "condition",
        threshold: 4,
      },
      message: message,
    });
    await roll.toMessage({
      flavor: "Condition Ending Roll",
      speaker: ChatMessage.getSpeaker({ actor: this }),
    });
  }

  /**
   * @inheritDoc
   * @returns {object}
   */
  getRollData() {
    return this.system.getRollData();
  }

  /**
   * Performs post-update operations for the actor.
   * @param {Teriock.Parameters.Actor.SkipFunctions} skipFunctions - Functions that should be skipped.
   * @returns {Promise<void>} Resolves when all post-update operations are complete
   * @returns {Promise<void>} Promise that resolves when post-update is complete.
   */
  async postUpdate(skipFunctions = {}) {
    const data = { skipFunctions };
    await this.hookCall("postUpdate", data);
    if (!data.cancel) {
      await this.system.postUpdate(data.skipFunctions);
    }
  }

  /** @inheritDoc */
  prepareData() {
    super.prepareData();
    this.prepareMechanicalDocuments();
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    this.itemKeys = {
      equipment: new Set(this.itemTypes?.equipment.map((e) => toCamelCase(e.name)) || []),
      power: new Set(this.itemTypes?.power.map((e) => toCamelCase(e.name)) || []),
      rank: new Set(this.itemTypes?.rank.map((e) => toCamelCase(e.name)) || []),
      species: new Set(this.itemTypes?.species.map((e) => toCamelCase(e.name)) || []),
    };
  }

  /** @inheritDoc */
  prepareEmbeddedDocuments() {
    this._embeddedPreparation = true;
    super.prepareEmbeddedDocuments();
    delete this._embeddedPreparation;
  }

  /**
   * Prepare all embedded {@link TeriockMechanicSheet} instances which within this primary {@link TeriockActor}.
   */
  prepareMechanicalDocuments() {
    for (const mechanic of this.itemTypes?.mechanic || []) {
      mechanic.prepareData();
    }
  }

  /**
   * Rolls a feat save for the specified attribute.
   *
   * Relevant wiki pages:
   * - [Feat Interaction](https://wiki.teriock.com/index.php/Core:Feat_Interaction)
   *
   * @param {Teriock.Parameters.Actor.Attribute} attribute - The attribute to roll a feat save for.
   * @param {Teriock.RollOptions.CommonRoll} [options] - Options for the roll.
   * @returns {Promise<void>}
   */
  async rollFeatSave(attribute, options = {}) {
    const data = {
      attribute,
      options,
    };
    await this.hookCall("rollFeatSave", data);
    if (!data.cancel) {
      await this.system.rollFeatSave(data.attribute, data.options);
    }
  }

  /**
   * Rolls an immunity save (these always succeed).
   *
   * Relevant wiki pages:
   * - [Immunity](https://wiki.teriock.com/index.php/Keyword:Immunity)
   *
   * @param {Teriock.RollOptions.CommonRoll} [options] - Options for the roll.
   * @returns {Promise<void>}
   */
  async rollImmunity(options = {}) {
    const data = { options };
    await this.hookCall("rollImmunity", data);
    if (!data.cancel) {
      await this.system.rollImmunity(data.options);
    }
  }

  /**
   * Rolls a resistance save.
   *
   * Relevant wiki pages:
   * - [Resistance](https://wiki.teriock.com/index.php/Ability:Resist_Effects)
   *
   * @param {Teriock.RollOptions.CommonRoll} [options] - Options for the roll.
   * @returns {Promise<void>}
   */
  async rollResistance(options = {}) {
    const data = { options };
    await this.hookCall("rollResistance", data);
    if (!data.cancel) {
      await this.system.rollResistance(data.options);
    }
  }

  /**
   * Rolls a tradecraft check.
   *
   * Relevant wiki pages:
   * - [Tradecrafts](https://wiki.teriock.com/index.php/Core:Tradecrafts)
   *
   * @param {Teriock.Parameters.Fluency.Tradecraft} tradecraft - The tradecraft to roll for.
   * @param {Teriock.RollOptions.CommonRoll} [options] - Options for the roll.
   * @returns {Promise<void>}
   */
  async rollTradecraft(tradecraft, options = {}) {
    const data = {
      tradecraft,
      options,
    };
    await this.hookCall("rollTradecraft", data);
    if (!data.cancel) {
      await this.system.rollTradecraft(data.tradecraft, data.options);
    }
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
    const data = await this.hookCall("takeAwaken");
    if (!data.cancel) {
      await this.system.takeAwaken();
    }
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
    const data = { amount };
    await this.hookCall("takeDamage", data);
    if (!data.cancel) {
      await this.system.takeDamage(data.amount);
    }
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
    const data = { amount };
    await this.hookCall("takeDrain", data);
    if (!data.cancel) {
      await this.system.takeDrain(data.amount);
    }
  }

  /**
   * Gains temporary hit points for the actor.
   *
   * Relevant wiki pages:
   * - [Temporary Hit Points](https://wiki.teriock.com/index.php/Core:Temporary_Hit_Points)
   *
   * @param {number} amount - The number of temporary hit points to gain.
   * @returns {Promise<void>} Promise that resolves when temporary hit points are gained.
   */
  async takeGainTempHp(amount) {
    const data = { amount };
    await this.hookCall("takeGainTempHp", data);
    if (!data.cancel) {
      await this.system.takeGainTempHp(data.amount);
    }
  }

  /**
   * Gains temporary mana points for the actor.
   *
   * Relevant wiki pages:
   * - [Temporary Mana Points](https://wiki.teriock.com/index.php/Core:Temporary_Mana_Points)
   *
   * @param {number} amount - The number of temporary mana points to gain.
   * @returns {Promise<void>} Promise that resolves when temporary mana points are gained.
   */
  async takeGainTempMp(amount) {
    const data = { amount };
    await this.hookCall("takeGainTempMp", data);
    if (!data.cancel) {
      await this.system.takeGainTempMp(data.amount);
    }
  }

  /**
   * Applies hack effect to a specific part of the actor.
   *
   * Relevant wiki pages:
   * - [Hack](https://wiki.teriock.com/index.php/Damage:Hack)
   *
   * @param {Teriock.Parameters.Actor.HackableBodyPart} part - The part to hack.
   * @returns {Promise<void>} Promise that resolves when hack is applied.
   */
  async takeHack(part) {
    const data = { part };
    await this.hookCall("takeHack", data);
    if (!data.cancel) {
      await this.system.takeHack(data.part);
    }
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
    const data = { amount };
    await this.hookCall("takeHeal", data);
    if (!data.cancel) {
      await this.system.takeHeal(data.amount);
    }
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
    const data = { amount };
    await this.hookCall("takeKill", data);
    if (!data.cancel) {
      await this.system.takeKill(data.amount);
    }
  }

  /**
   * Actor pays money.
   * @param {number} amount - The amount of gold-equivalent money to pay.
   * @param {Teriock.Parameters.Actor.PayMode} mode - Exact change or the closest denomination, rounded up.
   */
  async takePay(amount, mode = "greedy") {
    const data = {
      amount,
      mode,
    };
    await this.hookCall("takePay", data);
    if (!data.cancel) {
      await this.system.takePay(data.amount, data.mode);
    }
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
    const data = { amount };
    await this.hookCall("takeRevitalize", data);
    if (!data.cancel) {
      await this.system.takeRevitalize(data.amount);
    }
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
    const data = await this.hookCall("takeRevive");
    if (!data.cancel) {
      await this.system.takeRevive();
    }
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
    const data = { amount };
    await this.hookCall("takeSetTempHp", data);
    if (!data.cancel) {
      await this.system.takeSetTempHp(data.amount);
    }
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
    const data = { amount };
    await this.hookCall("takeSetTempMp", data);
    if (!data.cancel) {
      await this.system.takeSetTempMp(data.amount);
    }
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
    const data = { amount };
    await this.hookCall("takeSleep", data);
    if (!data.cancel) {
      await this.system.takeSleep(data.amount);
    }
  }

  /**
   * Removes hack effect from a specific part of the actor.
   *
   * Relevant wiki pages:
   * - [Hack](https://wiki.teriock.com/index.php/Damage:Hack)
   *
   * @param {Teriock.Parameters.Actor.HackableBodyPart} part - The part to unhack.
   * @returns {Promise<void>} Promise that resolves when unhack is applied.
   */
  async takeUnhack(part) {
    const data = { part };
    await this.hookCall("takeUnhack", data);
    if (!data.cancel) {
      await this.system.takeUnhack(data.part);
    }
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
    const data = { amount };
    await this.hookCall("takeWither", data);
    if (!data.cancel) {
      await this.system.takeWither(data.amount);
    }
  }

  /**
   * Uses an ability by name.
   * @param {string} abilityName - The name of the ability to use.
   * @param {Teriock.RollOptions.CommonRoll} [options] - Options for using the ability.
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
}
