import { TeriockRoll } from "../dice/_module.mjs";
import { copyItem } from "../helpers/fetch.mjs";
import { toCamelCase } from "../helpers/string.mjs";
import { pureUuid, selectUser } from "../helpers/utils.mjs";
import TeriockChatMessage from "./chat-message.mjs";
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
 * @property {TeriockTokenDocument} token
 */
export default class TeriockActor extends ParentDocumentMixin(
  CommonDocumentMixin(Actor),
) {
  /**
   * The default weight for a given size.
   *
   * Relevant wiki pages:
   * - [Weight](https://wiki.teriock.com/index.php/Core:Weight)
   *
   * @param {number} size
   * @param {"min"|"typical"|"max"} [amount]
   * @returns {number}
   */
  static defaultWeight(size, amount = "typical") {
    if (amount === "min") {
      size -= 0.5;
    }
    if (amount === "max") {
      size += 0.5;
    }
    return Math.max(0.001, Math.pow(3 + size, 3));
  }

  /**
   * Get the definition of several fields for a given numerical size value.
   *
   * Relevant wiki pages:
   * - [Size](https://wiki.teriock.com/index.php/Core:Size)
   *
   * @param {number} value
   * @returns {{ max: number, length: number, category: string, reach: number }}
   */
  static sizeDefinition(value) {
    const greaterThanEqualSizes = SIZE_DEFINITIONS.map((d) => d.max).filter(
      (m) => m >= value,
    );
    const sizeDefinitionMax = Math.min(...greaterThanEqualSizes);
    return foundry.utils.deepClone(
      SIZE_DEFINITIONS.find((d) => d.max === sizeDefinitionMax),
    );
  }

  /**
   * The {@link TeriockEffect}s that have special changes.
   * @type {TeriockEffect[]}
   */
  specialEffects = [];

  /**
   * @inheritDoc
   * @returns {TeriockActor}
   */
  get actor() {
    return this;
  }

  /** @returns {TeriockBody[]} */
  get bodyParts() {
    return this.itemTypes?.body || [];
  }

  /**
   * Gets effects that expire based on conditions.
   * @returns {TeriockConsequence[]} Array of condition expiration effects.
   */
  get conditionExpirationEffects() {
    return (
      this.consequences.filter((effect) => effect.system.conditionExpiration) ||
      []
    );
  }

  /**
   * Gets effects that expire at dawn.
   * @returns {TeriockConsequence[]} Array of dawn expiration effects.
   */
  get dawnExpirationEffects() {
    return (
      this.consequences.filter((effect) => effect.system.dawnExpiration) || []
    );
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
    return (
      this.system.hp.value < this.system.hp.max || this.statuses.has("hacked")
    );
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
    return /** @type {Readonly<Teriock.Documents.ActorModelMetadata>} */ super
      .metadata;
  }

  /**
   * Gets effects that expire based on movement.
   * @returns {TeriockConsequence[]} Array of movement expiration effects.
   */
  get movementExpirationEffects() {
    return (
      this.consequences.filter((effect) => effect.system.movementExpiration) ||
      []
    );
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

  /** @inheritDoc */
  _onUpdate(changed, options, userId) {
    super._onUpdate(changed, options, userId);
  }

  /**
   * @inheritDoc
   * @param {ActorData} data
   * @param {object} options
   * @param {TeriockUser} user
   * @returns {Promise<boolean|void>}
   */
  async _preCreate(data, options, user) {
    if ((await super._preCreate(data, options, user)) === false) {
      return false;
    }
    // Update Prototype Token
    const prototypeToken = {};
    const size = this.system.size.length;
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
    if (foundry.utils.hasProperty(changed, "system.size.saved")) {
      const tokenSize = this.constructor.sizeDefinition(
        changed.size.saved,
      ).length;
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
  *allApplicableEffects() {
    for (const effect of super.allApplicableEffects()) {
      yield effect;
    }
  }

  /**
   * The {@link TeriockEffect}s with special changes.
   * @yields {TeriockEffect}
   * @returns {Generator<TeriockEffect, void, void>}
   */
  *allSpecialEffects() {
    for (const effect of this.allApplicableEffects()) {
      if (effect.specialChanges.length > 0) {
        yield effect;
      }
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
      for (const archetype of ["mage", "semi", "warrior"]) {
        if (
          data.find(
            (d) => d.type === "rank" && d.system?.archetype === archetype,
          )
        ) {
          if (!this.itemKeys.power.has(archetype)) {
            data.push(
              await copyItem(TERIOCK.options.rank[archetype].name, "classes"),
            );
          }
        }
      }
    }
    if (
      embeddedName === "ActiveEffect" &&
      data.find((d) => d.type === "consequence")
    ) {
      for (const consequenceData of data.filter(
        (d) => d.type === "consequence",
      )) {
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
      const ranksBeingDeleted =
        this.ranks.filter((i) => ids.includes(i.id)) ?? [];
      const archetypesDeleted = new Set(
        ranksBeingDeleted.map((i) => i.system.archetype).filter(Boolean),
      );
      for (const archetype of ["mage", "semi", "warrior"]) {
        if (!archetypesDeleted.has(archetype)) {
          continue;
        }
        const remaining = this.ranks.some(
          (i) => i.system.archetype === archetype && !ids.includes(i.id),
        );
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
    await roll.toMessage(
      {
        flavor: "Condition Ending Roll",
        speaker: TeriockChatMessage.getSpeaker({ actor: this }),
      },
      {
        rollMode: game.settings.get("core", "rollMode"),
      },
    );
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
    this.prepareSpecialData();
    this.prepareVirtualEffects();
    foundry.helpers.Hooks.callAll(
      `teriock.actorPostUpdate`,
      this,
      selectUser(this).id,
    );
  }

  /** @inheritDoc */
  prepareDerivedData() {
    super.prepareDerivedData();
    this.itemKeys = {
      equipment: new Set(
        this.itemTypes?.equipment.map((e) => toCamelCase(e.name)) || [],
      ),
      power: new Set(
        this.itemTypes?.power.map((e) => toCamelCase(e.name)) || [],
      ),
      rank: new Set(this.itemTypes?.rank.map((e) => toCamelCase(e.name)) || []),
      species: new Set(
        this.itemTypes?.species.map((e) => toCamelCase(e.name)) || [],
      ),
    };
  }

  /** @inheritDoc */
  prepareEmbeddedDocuments() {
    this._embeddedPreparation = true;
    super.prepareEmbeddedDocuments();
    delete this._embeddedPreparation;
  }

  /** @inheritDoc */
  prepareSpecialData() {
    this.specialEffects = /** @type {TeriockEffect[]} */ Array.from(
      this.allSpecialEffects(),
    );
    this.items.forEach((i) => {
      i.prepareSpecialData();
    });
    super.prepareSpecialData();
  }

  /**
   * Prepare condition information now that all virtual statuses have been applied.
   */
  prepareVirtualConditionInformation() {
    for (const e of this.appliedEffects) {
      for (const s of e.statuses) {
        this.system.conditionInformation[s]?.reasons.add(e.name);
      }
    }
    if (this.system.conditionInformation.hacked.reasons.has("2nd Arm Hack")) {
      this.system.conditionInformation.hacked.reasons.delete("1st Arm Hack");
    }
    if (this.system.conditionInformation.hacked.reasons.has("2nd Leg Hack")) {
      this.system.conditionInformation.hacked.reasons.delete("1st Leg Hack");
    }
    for (const info of Object.values(this.system.conditionInformation)) {
      if (info.reasons.size > 0) {
        info.locked = true;
      }
    }
  }

  /**
   * Add statuses and explanations for "virtual effects". These are things that would otherwise be represented with
   * {@link TeriockEffect}s, but that we want to be able to add synchronously during the update cycle. Any of these
   * effects that should be shown on the token need to be manually added to {@link TeriockToken._drawEffects} as well.
   */
  prepareVirtualEffects() {
    this.prepareVirtualEncumbrance();
    this.prepareVirtualWounds();
    this.prepareVirtualMovement();
    this.prepareVirtualConditionInformation();
  }

  /**
   * Add statuses and explanations for being encumbered.
   */
  prepareVirtualEncumbrance() {
    if (
      this.system.encumbranceLevel > 0 &&
      !this.system.isProtected("statuses", "encumbered")
    ) {
      this.statuses.add("encumbered");
      if (this.system.encumbranceLevel === 1) {
        this.system.conditionInformation.encumbered.reasons.add(
          "Lightly Encumbered",
        );
        this.system.movementSpeed.value = Math.max(
          this.system.movementSpeed.value - 10,
          0,
        );
      } else if (this.system.encumbranceLevel === 2) {
        this.system.conditionInformation.encumbered.reasons.add(
          "Heavily Encumbered",
        );
        this.system.conditionInformation.slowed.reasons.add(
          "Heavily Encumbered",
        );
        this.statuses.add("slowed");
      } else if (this.system.encumbranceLevel === 3) {
        this.system.conditionInformation.encumbered.reasons.add(
          "Cannot Carry More",
        );
        this.statuses.add("slowed");
      }
    }
  }

  /**
   * Apply the effects of being slowed if applicable.
   */
  prepareVirtualMovement() {
    if (this.statuses.has("slowed")) {
      for (const [type, value] of Object.entries(
        this.system.speedAdjustments,
      )) {
        this.system.speedAdjustments[type] = Math.max(value - 1, 0);
      }
    }
  }

  /**
   * Add statuses and explanations for being wounded.
   */
  prepareVirtualWounds() {
    // Check what states are triggered in normal circumstances
    const hpUncn = this.system.hp.value < 1;
    const hpCrit =
      this.system.hp.value ===
      (this.system.hp.min < 0 ? this.system.hp.min + 1 : 0);
    const hpDead = this.system.hp.value === this.system.hp.min;
    const mpUncn = this.system.mp.value < 1;
    const mpCrit =
      this.system.mp.value ===
      (this.system.mp.min < 0 ? this.system.mp.min + 1 : 0);
    const mpDead = this.system.mp.value === this.system.mp.min;

    // Merge HP and MP
    const statDead = hpDead || mpDead;
    const statCrit = hpCrit || mpCrit;

    // Check what states are at least partially passively protected against
    const protUncn = this.system.isProtected("statuses", "unconscious");
    const protCrit = this.system.isProtected("statuses", "criticallyWounded");
    const protDead = this.system.isProtected("statuses", "dead");
    const protDown = this.system.isProtected("statuses", "down");

    // What wounds that supersede other wounds would apply automatically
    const autoDead = statDead && !protDead && !protDown;
    const autoCrit = statCrit && !protCrit && !protDown && !autoDead;

    // Factoring in protections and overriding states, which states would automatically trigger
    if (hpDead && !protDead && !protDown) {
      this.system.conditionInformation.dead.reasons.add(
        "Negative Half Maximum HP",
      );
      this.system.conditionInformation.down.reasons.add(
        "Negative Half Maximum HP",
      );
      this.statuses.add("dead");
      this.statuses.add("down");
    }
    if (mpDead && !protDead && !protDown) {
      this.system.conditionInformation.dead.reasons.add(
        "Negative Half Maximum MP",
      );
      this.system.conditionInformation.down.reasons.add(
        "Negative Half Maximum MP",
      );
      this.statuses.add("dead");
      this.statuses.add("down");
    }
    if (hpCrit && !protCrit && !protDown && !autoDead) {
      this.system.conditionInformation.criticallyWounded.reasons.add(
        "Critically Negative HP",
      );
      this.system.conditionInformation.down.reasons.add(
        "Critically Negative HP",
      );
      this.statuses.add("criticallyWounded");
      this.statuses.add("down");
    }
    if (mpCrit && !protCrit && !protDown && !autoDead) {
      this.system.conditionInformation.criticallyWounded.reasons.add(
        "Critically Negative MP",
      );
      this.system.conditionInformation.down.reasons.add(
        "Critically Negative MP",
      );
      this.statuses.add("criticallyWounded");
      this.statuses.add("down");
    }
    if (hpUncn && !protUncn && !autoCrit && !autoDead && !protDown) {
      if (this.system.hp.value === 0) {
        this.system.conditionInformation.unconscious.reasons.add("Zero HP");
        this.system.conditionInformation.down.reasons.add("Zero HP");
        this.statuses.add("unconscious");
        this.statuses.add("down");
      } else {
        this.system.conditionInformation.unconscious.reasons.add("Negative HP");
        this.system.conditionInformation.down.reasons.add("Negative HP");
        this.statuses.add("unconscious");
        this.statuses.add("down");
      }
    }
    if (mpUncn && !protUncn && !autoCrit && !autoDead && !protDown) {
      if (this.system.mp.value === 0) {
        this.system.conditionInformation.unconscious.reasons.add("Zero MP");
        this.system.conditionInformation.down.reasons.add("Zero MP");
        this.statuses.add("unconscious");
        this.statuses.add("down");
      } else {
        this.system.conditionInformation.unconscious.reasons.add("Negative MP");
        this.system.conditionInformation.down.reasons.add("Negative MP");
        this.statuses.add("unconscious");
        this.statuses.add("down");
      }
    }

    if (this.statuses.has("dead")) {
      this.statuses.delete("unconscious");
      this.statuses.delete("criticallyWounded");
    }
    if (this.statuses.has("criticallyWounded")) {
      this.statuses.delete("unconscious");
    }
  }

  /**
   * Uses an ability by name.
   * @param {string} abilityName - The name of the ability to use.
   * @param {Teriock.RollOptions.CommonRoll} [options] - Options for using the ability.
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
      foundry.ui.notifications.warn(
        `${this.name} does not have ${abilityName}.`,
      );
    }
  }
}

const SIZE_DEFINITIONS = [
  {
    max: 0.5,
    length: 2.5,
    category: "tiny",
    reach: 5,
  },
  {
    max: 2,
    length: 5,
    category: "small",
    reach: 5,
  },
  {
    max: 4,
    length: 5,
    category: "medium",
    reach: 5,
  },
  {
    max: 9,
    length: 10,
    category: "large",
    reach: 10,
  },
  {
    max: 14,
    length: 15,
    category: "huge",
    reach: 15,
  },
  {
    max: 20,
    length: 20,
    category: "gargantuan",
    reach: 20,
  },
  {
    max: Infinity,
    length: 30,
    category: "colossal",
    reach: 30,
  },
];
