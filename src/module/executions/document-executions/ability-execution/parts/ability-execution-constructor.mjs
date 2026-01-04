import TeriockChatMessage from "../../../../documents/chat-message/chat-message.mjs";
import { pureUuid } from "../../../../helpers/resolve.mjs";
import { ThresholdExecutionMixin } from "../../../mixins/_module.mjs";
import BaseDocumentExecution from "../../base-document-execution/base-document-execution.mjs";

/**
 * @extends {BaseDocumentExecution}
 * @mixes ThresholdExecution
 */
export default class AbilityExecutionConstructor extends ThresholdExecutionMixin(
  BaseDocumentExecution,
) {
  /**
   * @param {Teriock.Execution.AbilityExecutionOptions} options
   */
  constructor(
    options = /** @type {Teriock.Execution.AbilityExecutionOptions} */ {},
  ) {
    super(options);
    /** @type {TeriockArmament|null} */
    let defaultArmament = null;
    if (this.actor && this.source.system.interaction === "attack") {
      defaultArmament = this.actor.system.primaryAttacker;
    } else if (this.actor && this.source.system.interaction === "block") {
      defaultArmament = this.actor.system.primaryBlocker;
    }
    let {
      armament = defaultArmament,
      noHeighten = false,
      noTemplate = this.source.system.impacts.base.noTemplate,
      warded = this.source.system.warded,
      piercing = /** @type {PiercingModel} */ this.source.system.piercing.clone(),
      sb = this.actor?.system.offense.sb || 0,
      attackPenalty = "0",
      vitals = this.source.system.targets.has("vitals"),
    } = options;
    this.armament = armament;
    if (this.armament && this.source.system.isContact) {
      if (
        options.warded === undefined &&
        this.armament.system.warded &&
        ["attack", "block"].includes(this.source.system.interaction)
      ) {
        warded = true;
      }
      piercing.raw = Math.max(
        piercing.raw,
        this.armament.system.piercing.raw,
        this.actor?.system.offense.piercing.raw,
      );
      if (
        options.vitals === undefined &&
        this.source.system.interaction === "attack" &&
        this.armament.system.vitals
      ) {
        vitals = true;
      }
    }
    if (options.attackPenalty === undefined) {
      if (this.source.system.interaction === "attack") {
        if (this.source.system.isContact && this.armament) {
          attackPenalty = this.armament.system.attackPenalty.formula;
        } else {
          attackPenalty = "-3";
        }
      }
    }
    this.flags = {
      noHeighten: noHeighten,
      noTemplate: noTemplate,
    };
    this.warded = warded;
    if (this.actor) {
      this.executor = this.actor.defaultToken;
    }
    this.costs = {
      hp: 0,
      mp: 0,
      gp: 0,
    };
    this.sb = sb;
    this.piercing = piercing;
    this.attackPenaltyFormula = attackPenalty;
    this.attackPenalty = 0;
    this.vitals = vitals;
    this.targets = new Set();
  }

  /**
   * @inheritDoc
   * @returns {TeriockAbility}
   */
  get source() {
    return super.source;
  }

  /**
   * If the source ability has a macro, execute it.
   * @param {Teriock.Parameters.Shared.AbilityPseudoHook} pseudoHook
   * @returns {Promise<void>}
   */
  async executePseudoHookMacros(pseudoHook) {
    const macroEntries = Object.entries(this.source.system.impacts.macros);
    for (const [safeUuid, macroPseudoHook] of macroEntries) {
      if (macroPseudoHook === pseudoHook) {
        const macro = await fromUuid(pureUuid(safeUuid));
        if (macro) {
          try {
            await macro.execute({
              actor: this.actor,
              speaker: TeriockChatMessage.getSpeaker({
                actor: this.actor,
              }),
              args: [this],
              execution: this,
              useData: this,
              abilityData: this.source.system,
              chatData: this.chatData,
              data: { execution: this },
            });
          } catch (error) {
            console.error(
              `Could not execute macro with UUID ${pureUuid(safeUuid)}.`,
              error,
            );
          }
        }
      }
    }
  }

  /**
   * Get some merged property from the source ability's impacts.
   * @param {string} property
   * @param {function} method
   * @param {object} [options]
   * @param {function} [options.baseMethod]
   * @param {function} [options.heightenedMethod]
   * @returns {*}
   */
  mergeImpacts(property, method, { baseMethod, heightenedMethod } = {}) {
    const { base, proficient, fluent, heightened } = this.source.system.impacts;
    let result = foundry.utils.getProperty(base, property);
    if (baseMethod) {
      result = baseMethod(result);
    }
    if (!heightenedMethod) {
      heightenedMethod = method;
    }
    if (this.proficient) {
      result = method(result, foundry.utils.getProperty(proficient, property));
    }
    if (this.fluent) {
      result = method(result, foundry.utils.getProperty(fluent, property));
    }
    if (this.heightened) {
      result = heightenedMethod(
        result,
        foundry.utils.getProperty(heightened, property),
      );
    }
    return result;
  }

  /**
   * Merge impact booleans.
   * @param {string} property
   * @returns {boolean}
   */
  mergeImpactsBool(property) {
    const method = (a, b) => a || b;
    return this.mergeImpacts(property, method);
  }

  /**
   * Merge impact numbers.
   * @param {string} property
   * @param {boolean} [round]
   * @returns {number}
   */
  mergeImpactsNumber(property, round = false) {
    const heightened = this.heightened;
    const method = (a, b) => Math.max(a, b);
    const heightenedMethod = (a, b) => {
      let c = a + heightened * b;
      if (round) {
        c = Math.round(c / b) * heightened;
      }
      return c;
    };
    return this.mergeImpacts(property, method, { heightenedMethod });
  }

  /**
   * Merge impact sets.
   * @param {string} property
   * @returns {Set<*>}
   */
  mergeImpactsSet(property) {
    const method = (a, b) => {
      return new Set([...Array.from(a), ...Array.from(b)]);
    };
    return this.mergeImpacts(property, method);
  }
}
