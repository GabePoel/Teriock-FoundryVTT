import { TeriockDialog } from "../../applications/api/_module.mjs";
import { documentTypes } from "../../constants/system/_module.mjs";
import { systemPath } from "../../helpers/path.mjs";
import { pureUuid, resolveDocument } from "../../helpers/resolve.mjs";
import { toCamelCase } from "../../helpers/string.mjs";
import { makeIconClass, mix } from "../../helpers/utils.mjs";
import * as mixins from "../mixins/_module.mjs";
import TeriockTokenDocument from "../token-document/token-document.mjs";

const { Actor } = foundry.documents;

/**
 * The Teriock {@link Actor} implementation.
 * @extends {Actor}
 * @extends {ClientDocument}
 * @mixes BaseDocument
 * @mixes CommonDocument
 * @mixes ParentDocument
 * @mixes RetrievalDocument
 * @mixes OperationTriggerData
 * @property {TypeCollection<GenericActiveEffect, GenericActiveEffect>} effects
 * @property {TypeCollection<GenericItem, GenericItem>} items
 * @property {Teriock.Documents.ActorModel} system
 * @property {Teriock.Documents.ActorType} type
 * @property {ID<TeriockActor>} _id
 * @property {ID<TeriockActor>} id
 * @property {UUID<TeriockActor>} uuid
 * @property {BaseActorSheet} sheet
 */
export default class TeriockActor extends mix(
  Actor,
  mixins.BaseDocumentMixin,
  mixins.CommonDocumentMixin,
  mixins.ParentDocumentMixin,
  mixins.RetrievalDocumentMixin,
) {
  /** @inheritDoc */
  static get documentMetadata() {
    return Object.assign(super.documentMetadata, {
      types: Object.keys(documentTypes.actors),
    });
  }

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
   * Is this actor active?
   * @returns {boolean}
   */
  get active() {
    return true;
  }

  /**
   * Enabled body parts and equipped equipment.
   * @returns {TeriockArmament[]}
   */
  get activeArmaments() {
    return [
      ...this.equipment.filter((e) => e.system.equipped),
      ...this.bodyParts.filter((b) => !b.disabled),
    ];
  }

  //noinspection JSUnusedGlobalSymbols
  /**
   * Body parts and equipment.
   * @returns {TeriockArmament[]}
   */
  get armaments() {
    return [...this.bodyParts, ...this.equipment];
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
   * Get the best token placeable for this actor.
   * @returns {TeriockToken|null}
   */
  get defaultToken() {
    if (this.token) return this.token.object;
    return this.getActiveTokens()[0] || null;
  }

  /**
   * Get the best user for this actor.
   * @returns {TeriockUser|null}
   */
  get defaultUser() {
    let selectedUser = null;
    // See if any user has the actor as a character
    game.users.forEach((user) => {
      if (user.character?.uuid === this.uuid && user.active) {
        selectedUser = user;
      }
    });
    // See if any players have control over the actor
    if (!selectedUser) {
      game.users.forEach((user) => {
        if (
          !user.isActiveGM &&
          this.canUserModify(user, "update") &&
          user.active
        ) {
          selectedUser = user;
        }
      });
    }
    // See if anyone has control over the actor
    if (!selectedUser) {
      game.users.forEach((user) => {
        if (this.canUserModify(user, "update") && user.active) {
          selectedUser = user;
        }
      });
    }
    if (!selectedUser) {
      selectedUser = game.users.activeGM;
    }
    return selectedUser;
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
   * Item keys by type.
   * @returns {Teriock.Parent.ParentItemKeys}
   */
  get itemKeys() {
    const out = {};
    const itemTypes = this.itemTypes;
    for (const key of Object.keys(TERIOCK.system.documentTypes.items)) {
      out[key] = new Set(
        (itemTypes[key] || []).map((i) => toCamelCase(i.name)),
      );
    }
    return out;
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

  /**
   * Transformations.
   * @returns {TeriockLingering[]}
   */
  get transformations() {
    const possibleEffects = [...this.consequences, ...this.conditions];
    return possibleEffects.filter((c) => c.system.isTransformation);
  }

  /**
   * @inheritDoc
   * @returns {GenericActiveEffect[]}
   */
  get validEffects() {
    //noinspection JSValidateTypes
    return Array.from(this.allApplicableEffects());
  }

  /** @inheritDoc */
  get visibleChildren() {
    return [...this.validEffects, ...this.items.contents]
      .filter((c) => !c.isEphemeral)
      .filter(
        (c) => !c.metadata.revealable || c.system.revealed || game.user.isGM,
      );
  }

  /**
   * Helper method to add a virtual status.
   * @param {Teriock.Parameters.Condition.ConditionKey} condition
   * @param {string} reason
   * @param {object} [options]
   * @param {boolean} [options.localize]
   */
  _addVirtualStatus(condition, reason, options = {}) {
    let { localize = true } = options;
    if (!reason) reason = TERIOCK.reference.conditions[condition];
    this.system.conditionInformation[condition]?.reasons?.add(
      localize ? game.i18n.localize(reason) : reason,
    );
    this.statuses.add(condition);
  }

  /**
   * Helper method to add multiple virtual statuses with the same reason.
   * @param {Teriock.Parameters.Condition.ConditionKey[]} conditions
   * @param {string} reason
   * @param {object} [options]
   * @param {boolean} [options.localize]
   */
  _addVirtualStatuses(conditions, reason, options = {}) {
    for (const condition of conditions) {
      this._addVirtualStatus(condition, reason, options);
    }
  }

  /** @inheritDoc */
  _onDawn() {
    super._onDawn();
    for (const effect of this.dawnExpirationEffects) {
      effect.system.expire().then();
    }
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
    const elder = await this.getElder();
    if (elder && !elder.metadata.childActorTypes.includes(this.type)) {
      return false;
    }
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

  /** @inheritDoc */
  async _preLongRest() {
    await super._preLongRest();
    if (this.statuses.has("dead")) return;
    const heal =
      game.settings.get("teriock", "showLongRestDialog") &&
      (await TeriockDialog.confirm({
        window: {
          title: game.i18n.localize(
            "TERIOCK.SHEETS.Actor.ACTIONS.TakeLongRest.label",
          ),
          icon: makeIconClass(TERIOCK.display.icons.ui.longRest, "title"),
        },
        content: game.i18n.localize(
          "TERIOCK.SHEETS.Actor.ACTIONS.TakeLongRest.healText",
        ),
        modal: true,
        rejectClose: false,
      }));
    if (heal) {
      const toUpdate = [];
      for (const item of [...this.ranks, ...this.species, ...this.mounts]) {
        const itemUpdates = { _id: item.id };
        const hpDice = item.system.statDice.hp.dice.map((d) => d.toObject());
        for (const d of hpDice) {
          d.spent = false;
        }
        const mpDice = item.system.statDice.mp.dice.map((d) => d.toObject());
        for (const d of mpDice) {
          d.spent = false;
        }
        itemUpdates["system.statDice.hp.dice"] = hpDice;
        itemUpdates["system.statDice.mp.dice"] = mpDice;
        toUpdate.push(itemUpdates);
      }
      await this.updateChildDocuments("Item", toUpdate);
      await this.update({
        "system.hp.value": this.system.hp.max,
        "system.mp.value": this.system.mp.max,
      });
    }
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
    if (
      foundry.utils.hasProperty(changed, "img") &&
      !foundry.utils.hasProperty(changed, "prototypeToken.texture.src") &&
      foundry.utils
        .getProperty(changed, "img")
        .startsWith(systemPath("icons/creatures"))
    ) {
      foundry.utils.setProperty(
        changed,
        "prototypeToken.texture.src",
        TeriockTokenDocument.ringImage(
          foundry.utils.getProperty(changed, "img"),
        ),
      );
    }
    const tokenUpdates =
      foundry.utils.getProperty(changed, "prototypeToken") || {};
    if (foundry.utils.hasProperty(changed, "system.size.raw")) {
      const tokenSize = this.constructor.sizeDefinition(
        changed.size.raw,
      ).length;
      if (!foundry.utils.hasProperty(changed, "prototypeToken.width")) {
        tokenUpdates["prototypeToken.width"] = tokenSize;
        tokenUpdates["prototypeToken.height"] = tokenSize;
      }
      for (const token of this.getDependentTokens()) {
        if (token.parent?.grid?.type === 0) {
          await token.resize({
            width: tokenSize,
            height: tokenSize,
          });
        }
      }
    }
    if (Object.keys(tokenUpdates).length > 0) {
      for (const token of this.getDependentTokens()) {
        if (token.id) {
          await token.update(tokenUpdates);
        }
      }
    }
  }

  /**
   * All abilities, including virtual ones.
   * @returns {Promise<TeriockAbility[]>}
   */
  async allAbilities() {
    const basicAbilitiesItem = await resolveDocument(
      game.teriock.packs.essentials.index.getName("Basic Abilities"),
    );
    return [...basicAbilitiesItem.abilities, ...this.abilities];
  }

  /**
   * Add multiple status effects to the actor.
   * @param {string[]} statusIds
   * @returns {Promise<void>}
   */
  async applyStatusEffects(statusIds) {
    const effects = await Promise.all(
      statusIds.map(async (id) => ActiveEffect.fromStatusEffect(id)),
    );
    await this.createEmbeddedDocuments("ActiveEffect", effects, {
      keepId: true,
    });
  }

  /**
   * Prepare condition information now that all virtual statuses have been applied.
   */
  cleanConditionInformation() {
    if (
      this.system.conditionInformation.hacked.reasons.has(
        game.i18n.localize("TERIOCK.STATUSES.Hacks.armHack2"),
      )
    ) {
      this.system.conditionInformation.hacked.reasons.delete(
        game.i18n.localize("TERIOCK.STATUSES.Hacks.armHack1"),
      );
    }
    if (
      this.system.conditionInformation.hacked.reasons.has(
        game.i18n.localize("TERIOCK.STATUSES.Hacks.legHack2"),
      )
    ) {
      this.system.conditionInformation.hacked.reasons.delete(
        game.i18n.localize("TERIOCK.STATUSES.Hacks.legHack1"),
      );
    }
    for (const info of Object.values(this.system.conditionInformation)) {
      if (info.reasons.size > 0) {
        info.locked = true;
      }
    }
  }

  /**
   * @inheritDoc
   * @param {TeriockChildName} embeddedName
   * @param {object[]} data
   * @param {DatabaseCreateOperation} [operation={}]
   * @returns {Promise<TeriockChild[]>}
   */
  async createEmbeddedDocuments(embeddedName, data = [], operation = {}) {
    if (
      embeddedName === "ActiveEffect" &&
      data.find((d) => d.type === "consequence")
    ) {
      for (const consequenceData of data.filter(
        (d) => d.type === "consequence",
      )) {
        const changes = consequenceData?.system?.impacts?.changes;
        if (changes && changes.length > 0) {
          for (const change of changes) {
            if (change.key === "system.hookedMacros.effectApplication") {
              const uuid = pureUuid(change.value);
              /** @type {TeriockMacro|null} */
              const macro = await fromUuid(uuid);
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
    return super.createEmbeddedDocuments(embeddedName, data, operation);
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
   * @returns {Promise<void>}
   */
  async postUpdate(skipFunctions = {}) {
    const data = { skipFunctions };
    await this.hookCall("postUpdate", data);
    if (data.cancel) return;
    await this.system.postUpdate(data.skipFunctions);
  }

  /** @inheritDoc */
  prepareData() {
    super.prepareData();
    this.prepareSpecialData();
    this.prepareVirtualEffects();
    const user = this.defaultUser;
    if (user?.id) {
      foundry.helpers.Hooks.callAll(`teriock.actorPostUpdate`, this, user.id);
    }
  }

  /** @inheritDoc */
  prepareVirtualEffects() {
    for (const e of this.validEffects) {
      for (const s of e.statuses) {
        if (!e.id.startsWith(s)) {
          this.system.conditionInformation[s]?.reasons.add(e.name);
        }
      }
    }
    this.system.prepareVirtualEffects();
    this.prepareVirtualWounds();
    this.cleanConditionInformation();
  }

  /**
   * Add statuses and explanations for being wounded.
   */
  prepareVirtualWounds() {
    if (!this.getSetting("automaticallyWound")) return;
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
      this._addVirtualStatuses(
        ["dead", "down"],
        "TERIOCK.SYSTEMS.BaseActor.VIRTUAL_EFFECTS.negativeHalfMaxHp",
      );
    }
    if (mpDead && !protDead && !protDown) {
      this._addVirtualStatuses(
        ["dead", "down"],
        "TERIOCK.SYSTEMS.BaseActor.VIRTUAL_EFFECTS.negativeHalfMaxMp",
      );
    }
    if (hpCrit && !protCrit && !protDown && !autoDead) {
      this._addVirtualStatuses(
        ["criticallyWounded", "down"],
        "TERIOCK.SYSTEMS.BaseActor.VIRTUAL_EFFECTS.criticallyNegativeHp",
      );
    }
    if (mpCrit && !protCrit && !protDown && !autoDead) {
      this._addVirtualStatuses(
        ["criticallyWounded", "down"],
        "TERIOCK.SYSTEMS.BaseActor.VIRTUAL_EFFECTS.criticallyNegativeMp",
      );
    }
    if (hpUncn && !protUncn && !autoCrit && !autoDead && !protDown) {
      if (this.system.hp.value === 0) {
        this._addVirtualStatuses(
          ["unconscious", "down"],
          "TERIOCK.SYSTEMS.BaseActor.VIRTUAL_EFFECTS.zeroHp",
        );
      } else {
        this._addVirtualStatuses(
          ["unconscious", "down"],
          "TERIOCK.SYSTEMS.BaseActor.VIRTUAL_EFFECTS.negativeHp",
        );
      }
    }
    if (mpUncn && !protUncn && !autoCrit && !autoDead && !protDown) {
      if (this.system.mp.value === 0) {
        this._addVirtualStatuses(
          ["unconscious", "down"],
          "TERIOCK.SYSTEMS.BaseActor.VIRTUAL_EFFECTS.zeroMp",
        );
      } else {
        this._addVirtualStatuses(
          ["unconscious", "down"],
          "TERIOCK.SYSTEMS.BaseActor.VIRTUAL_EFFECTS.negativeMp",
        );
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
   * Remove multiple status effects from the actor.
   * @param statusIds
   * @returns {Promise<void>}
   */
  async removeStatusEffects(statusIds) {
    const candidates = CONFIG.statusEffects.filter((e) =>
      statusIds.includes(e.id),
    );
    const toRemove = candidates
      .filter((e) => this.effects.get(e?._id))
      .map((e) => e?._id);
    await this.deleteEmbeddedDocuments("ActiveEffect", toRemove);
  }

  /**
   * Uses an ability by name.
   * @param {string} abilityName - The name of the ability to use.
   * @param {Teriock.Execution.AbilityExecutionOptions} [options] - Options for using the ability.
   * @returns {Promise<void>}
   */
  async useAbility(abilityName, options = {}) {
    const abilities = await this.allAbilities();
    const ability = abilities.find((i) => i.name === abilityName);
    if (ability) {
      await ability.use(Object.assign(options, { actor: this }));
    } else {
      ui.notifications.warn("TERIOCK.SYSTEMS.Macro.EXECUTION.noDocument", {
        format: {
          actor: this.name,
          type: TERIOCK.options.document.ability.name.toLowerCase(),
          name: abilityName,
        },
        localize: true,
      });
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
