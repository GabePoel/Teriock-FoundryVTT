import { characterOptions } from "../helpers/constants/character-options.mjs";
import { rankOptions } from "../helpers/constants/rank-options.mjs";
import { copyItem } from "../helpers/fetch.mjs";
import { pureUuid, toCamelCase } from "../helpers/utils.mjs";
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

  /** @returns {TeriockEquipment[]} */
  get equipment() {
    return this.itemTypes?.equipment || [];
  }

  /** @returns {TeriockRank[]} */
  get ranks() {
    return this.itemTypes?.rank || [];
  }

  /** @returns {TeriockPower[]} */
  get powers() {
    return this.itemTypes?.power || [];
  }

  /**
   * Gets effects that expire based on conditions.
   *
   * @returns {TeriockEffect[]} Array of condition expiration effects.
   */
  get conditionExpirationEffects() {
    return (
      this.effectTypes.consequence?.filter(
        (effect) => effect.system.conditionExpiration,
      ) || []
    );
  }

  /**
   * Gets effects that expire based on movement.
   *
   * @returns {TeriockEffect[]} Array of movement expiration effects.
   */
  get movementExpirationEffects() {
    return (
      this.effectTypes.consequence?.filter(
        (effect) => effect.system.movementExpiration,
      ) || []
    );
  }

  /**
   * Gets effects that expire at dawn.
   *
   * @returns {TeriockEffect[]} Array of dawn expiration effects.
   */
  get dawnExpirationEffects() {
    return (
      this.effectTypes.consequence?.filter(
        (effect) => effect.system.dawnExpiration,
      ) || []
    );
  }

  /**
   * Gets effects that expire when sustained abilities end.
   *
   * @returns {TeriockEffect[]} Array of sustained expiration effects.
   */
  get sustainedExpirationEffects() {
    return (
      this.effectTypes.consequence?.filter(
        (effect) => effect.system.sustainedExpiration,
      ) || []
    );
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
   * @inheritDoc
   * @param {TeriockActor[]} documents - Pending document instances to be created
   * @param {DatabaseCreateOperation} operation - Parameters of the database creation operation
   * @param {TeriockUser} user - The User requesting the creation operation
   * @returns {Promise<boolean|void>} - Return false to cancel the creation operation entirely
   */
  static async _preCreateOperation(documents, operation, user) {
    await super._preCreateOperation(documents, operation, user);
    for (const actor of documents.filter(
      (d) => new Set(d.items || [])?.size < 1,
    )) {
      actor.updateSource({
        items: [
          (await copyItem("Basic Abilities", "essentials")).toObject(),
          (await copyItem("Created Elder Sorceries", "essentials")).toObject(),
          (await copyItem("Learned Elder Sorceries", "essentials")).toObject(),
          (await copyItem("Journeyman", "classes")).toObject(),
          (await copyItem("Foot", "equipment")).toObject(),
          (await copyItem("Hand", "equipment")).toObject(),
          (await copyItem("Mouth", "equipment")).toObject(),
          (await copyItem("Human", "species")).toObject(),
        ],
      });
    }
  }

  /**
   * Figure out the named for a given size.
   *
   * @param {number} size
   * @returns {string}
   */
  static toNamedSize(size) {
    const sizeKeys = Object.keys(characterOptions.namedSizes).map(Number);
    const filteredSizeKeys = sizeKeys.filter((key) => key <= size);
    const sizeKey = Math.max(...filteredSizeKeys, 0);
    return characterOptions.namedSizes[sizeKey] || "Medium";
  }

  /**
   * @inheritDoc
   * @param {object} data
   * @param {object} options
   * @param {TeriockUser} user
   * @returns {Promise<boolean|void>}
   */
  async _preCreate(data, options, user) {
    super._preCreate(data, options, user);
    const prototypeToken = {};
    const size =
      characterOptions.tokenSizes[TeriockActor.toNamedSize(this.system.size)] ||
      1;
    if (!foundry.utils.hasProperty(data, "prototypeToken.sight.enabled"))
      prototypeToken.sight = { enabled: true, range: null };
    if (!foundry.utils.hasProperty(data, "prototypeToken.width"))
      prototypeToken.width = size;
    if (!foundry.utils.hasProperty(data, "prototypeToken.height"))
      prototypeToken.height = size;
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
    super._preUpdate(changed, options, user);
    if (foundry.utils.hasProperty(changed, "system.size")) {
      const tokenSize =
        characterOptions.tokenSizes[
          TeriockActor.toNamedSize(changed.system.size)
        ] || 1;
      if (!foundry.utils.hasProperty(changed, "prototypeToken.width")) {
        changed.prototypeToken ||= {};
        changed.prototypeToken.height = tokenSize;
        changed.prototypeToken.width = tokenSize;
      }
      for (const token of /** @type {TeriockToken[]} */ this.getDependentTokens()) {
        if (token.parent?.grid?.type === 0) {
          await token.resize({ width: tokenSize, height: tokenSize });
        } else {
          await token.update({ width: tokenSize, height: tokenSize });
        }
      }
    }
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    this.itemKeys = {
      equipment: new Set(
        this.itemTypes?.equipment.map((e) => toCamelCase(e.name)),
      ),
      power: new Set(this.itemTypes?.power.map((e) => toCamelCase(e.name))),
      rank: new Set(this.itemTypes?.rank.map((e) => toCamelCase(e.name))),
    };
  }

  /**
   * @inheritDoc
   * @param {string} embeddedName
   * @param {object[]} data
   * @param {DatabaseCreateOperation} [operation={}]
   * @returns {Promise<Document[]>}
   */
  async createEmbeddedDocuments(embeddedName, data = [], operation = {}) {
    if (
      embeddedName === "Item" &&
      data.find((d) => d.type === "rank" && d.system?.archetype === "mage")
    ) {
      if (!this.itemKeys?.power.has("mage"))
        data.push(await copyItem("Mage", "classes"));
    }
    if (
      embeddedName === "Item" &&
      data.find((d) => d.type === "rank" && d.system?.archetype === "semi")
    ) {
      if (!this.itemKeys?.power.has("semi"))
        data.push(await copyItem("Semi", "classes"));
    }
    if (
      embeddedName === "Item" &&
      data.find((d) => d.type === "rank" && d.system?.archetype === "warrior")
    ) {
      if (!this.itemKeys?.power.has("warrior"))
        data.push(await copyItem("Warrior", "classes"));
    }
    if (
      embeddedName === "ActiveEffect" &&
      data.find((d) => d.type === "consequence")
    ) {
      for (const abilityData of data.filter((d) => d.type === "consequence")) {
        const changes = abilityData?.changes;
        if (changes && changes.length > 0) {
          for (const change of changes) {
            if (change.key === "system.hookedMacros.effectApplication") {
              const uuid = pureUuid(change.value);
              /** @type {TeriockMacro|null} */
              const macro = await game.teriock.api.utils.fromUuid(uuid);
              if (macro) {
                await macro.execute({ actor: this });
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
   *
   * @inheritDoc
   * @param {string} embeddedName - The name of the embedded Document type
   * @param {string[]} ids - An array of string ids for each Document to be deleted
   * @param {DatabaseDeleteOperation} [operation={}] - Parameters of the database deletion workflow
   * @returns {Promise<Document[]>} - An array of deleted Document instances
   */
  async deleteEmbeddedDocuments(embeddedName, ids = [], operation = {}) {
    if (embeddedName === "Item") {
      const ranksBeingDeleted =
        this.itemTypes?.rank?.filter((i) => ids.includes(i.id)) ?? [];
      const archetypesDeleted = new Set(
        ranksBeingDeleted.map((i) => i.system?.archetype).filter(Boolean),
      );
      for (const archetype of ["mage", "semi", "warrior"]) {
        if (!archetypesDeleted.has(archetype)) continue;
        const remaining = this.itemTypes?.rank?.some(
          (i) => i.system?.archetype === archetype && !ids.includes(i.id),
        );
        if (!remaining) {
          const powerName = rankOptions[archetype].name;
          const powerItem = this.itemTypes?.power?.find(
            (i) => i.name === powerName,
          );
          if (powerItem && !ids.includes(powerItem.id)) ids.push(powerItem.id);
        }
      }
    }
    return await super.deleteEmbeddedDocuments(embeddedName, ids, operation);
  }

  /**
   * @inheritDoc
   * @returns {object}
   */
  getRollData() {
    return this.system.getRollData();
  }

  /**
   * Execute all macros for a given pseudo-hook and call a regular hook with the same name.
   *
   * @param {Teriock.PseudoHook} name - The name of the pseudo-hook and hook to call.
   * @param {any[]} args - Arguments to pass to the pseudo-hook macros and the hook.
   */
  async hookCall(name, ...args) {
    Hooks.callAll(`teriock.${name}`, this, ...args);
    if (this.system.hookedMacros[name]) {
      for (const macroUuid of this.system.hookedMacros[name]) {
        const macro = await game.teriock.api.utils.fromUuid(macroUuid);
        if (macro) {
          await macro.execute({ actor: this, args: [...args] });
        }
      }
    }
  }

  /**
   * Performs post-update operations for the actor.
   *
   * @param {Teriock.SkipFunctions} skipFunctions - Functions that should be skipped.
   * @returns {Promise<void>} Resolves when all post-update operations are complete
   * @returns {Promise<void>} Promise that resolves when post-update is complete.
   */
  async postUpdate(skipFunctions = {}) {
    await this.hookCall("postUpdate", skipFunctions);
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
    await this.hookCall("takeDamage", amount);
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
    await this.hookCall("takeDrain", amount);
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
    await this.hookCall("takeWither", amount);
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
    await this.hookCall("takeHeal", amount);
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
    await this.hookCall("takeRevitalize", amount);
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
    await this.hookCall("takeSetTempHp", amount);
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
    await this.hookCall("takeSetTempMp", amount);
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
    await this.hookCall("takeGainTempHp", amount);
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
    await this.hookCall("takeGainTempMp", amount);
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
    await this.hookCall("takeSleep", amount);
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
    await this.hookCall("takeKill", amount);
    await this.system.takeKill(amount);
  }

  /**
   * Actor pays money.
   *
   * @param {number} amount - The amount of gold-equivalent money to pay.
   * @param {"exact" | "greedy"} mode - Exact change or closest denomination, rounded up.
   */
  async takePay(amount, mode = "greedy") {
    await this.hookCall("takePay", amount);
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
    await this.hookCall("takeHack", part);
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
    await this.hookCall("takeUnhack", part);
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
    await this.hookCall("takeAwaken");
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
    await this.hookCall("takeRevive");
    await this.system.takeRevive();
  }

  /**
   * Rolls a feat save for the specified attribute.
   *
   * Relevant wiki pages:
   * - [Feat Interaction](https://wiki.teriock.com/index.php/Core:Feat_Interaction)
   *
   * @param {Teriock.Attribute} attribute - The attribute to roll a feat save for.
   * @param {Teriock.CommonRollOptions} [options] - Options for the roll.
   * @returns {Promise<void>}
   */
  async rollFeatSave(attribute, options = {}) {
    await this.hookCall("rollFeatSafe", options);
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
    await this.hookCall("rollResistance", options);
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
    await this.hookCall("rollImmunity", options);
    await this.system.rollImmunity(options);
  }

  /**
   * Rolls a tradecraft check.
   *
   * Relevant wiki pages:
   * - [Tradecrafts](https://wiki.teriock.com/index.php/Core:Tradecrafts)
   *
   * @param {Teriock.Tradecraft} tradecraft - The tradecraft to roll for.
   * @param {Teriock.CommonRollOptions} [options] - Options for the roll.
   * @returns {Promise<void>}
   */
  async rollTradecraft(tradecraft, options = {}) {
    await this.hookCall("rollTradecraft", options);
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
    const abilities = Array.from(this.allApplicableEffects()).filter(
      (i) => i.type === "ability",
    );
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
}
