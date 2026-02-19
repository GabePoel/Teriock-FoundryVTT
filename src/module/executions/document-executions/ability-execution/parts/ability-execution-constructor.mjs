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
  constructor(options = {}) {
    super(options);
    const sys = this.source.system;
    this.armament =
      options.armament ?? this.#determineDefaultArmament(sys.interaction);
    this.#initializeFlags(options);
    this.#initializeCosts(options);
    this.sb = options.sb ?? this.actor?.system.offense.sb ?? 0;
    this.piercing = this.#resolvePiercing(options, sys);
    this.warded = this.#resolveWarded(options, sys);
    this.vitals = this.#resolveVitals(options, sys);
    this.limb = this.#resolveLimb(options, sys);
    this.attackPenaltyFormula = this.#resolveAttackPenalty(options, sys);
    this.executor = this.actor?.defaultToken ?? null;
    this.attackPenalty = 0;
    this.targets = new Set();
  }

  /** @inheritDoc */
  get _macroExecutionScope() {
    return {
      ...super._macroExecutionScope,
      ability: this.source,
    };
  }

  /**
   * @inheritDoc
   * @returns {BaseAutomation[]}
   */
  get activeAutomations() {
    const automations = /** @type {BaseAutomation[]} */ super.activeAutomations;
    return automations.filter(
      (a) =>
        (a.heighten.has(0) && !this.heightened) ||
        (a.heighten.has(1) && this.heightened),
    );
  }

  /**
   * @inheritDoc
   * @returns {TeriockAbility}
   */
  get source() {
    return super.source;
  }

  /**
   * Logic to pick armament based on interaction type.
   * @param {string} interaction - The interaction type (e.g., 'attack', 'block').
   * @returns {TeriockArmament|null}
   */
  #determineDefaultArmament(interaction) {
    if (!this.actor) return null;
    if (interaction === "attack") return this.actor.system.primaryAttacker;
    if (interaction === "block") return this.actor.system.primaryBlocker;
    return null;
  }

  /**
   * Syncs cost options and initializes cost tracking.
   * @param {Teriock.Execution.AbilityExecutionOptions} options
   */
  #initializeCosts(options) {
    Object.assign(this.options, {
      noMp: options.noMp ?? !this.source.getSetting("promptCostMp"),
      noGp: options.noGp ?? !this.source.getSetting("promptCostGp"),
      noHp: options.noHp ?? !this.source.getSetting("promptCostHp"),
    });
    this.costs = { hp: 0, mp: 0, gp: 0 };
  }

  /**
   * Handles UI/Prompting flags.
   * @param {Teriock.Execution.AbilityExecutionOptions} options
   */
  #initializeFlags(options) {
    this.flags = {
      noHeighten:
        options.noHeighten ?? !this.source.getSetting("promptHeighten"),
      noTemplate:
        options.noTemplate ?? !this.source.getSetting("promptTemplate"),
    };
  }

  /**
   * Determines the formula for attack penalties.
   * @param {Teriock.Execution.AbilityExecutionOptions} options
   * @param {AbilitySystem} sys - The source system data.
   * @returns {string}
   */
  #resolveAttackPenalty(options, sys) {
    if (options.attackPenalty !== undefined) return options.attackPenalty;
    if (sys.interaction !== "attack") return "0";

    return sys.isContact && this.armament
      ? this.armament.system.attackPenalty.formula
      : "-3";
  }

  /**
   * Determines if limbs are being targeted.
   * @param {Teriock.Execution.AbilityExecutionOptions} options
   * @param {AbilitySystem} sys - The source system data.
   * @returns {boolean}
   */
  #resolveLimb(options, sys) {
    if (options.limb !== undefined) return options.limb;
    return (
      sys.isContact &&
      (sys.targets.has("arm") ||
        sys.targets.has("leg") ||
        sys.targets.has("limb"))
    );
  }

  /**
   * Resolves piercing by comparing source, armament, and actor offense.
   * @param {Teriock.Execution.AbilityExecutionOptions} options
   * @param {AbilitySystem} sys - The source system data.
   * @returns {PiercingModel}
   */
  #resolvePiercing(options, sys) {
    const piercing = options.piercing?.clone() ?? sys.piercing.clone();
    if (this.armament && sys.isContact) {
      piercing.raw = Math.max(
        piercing.raw,
        this.armament.system.piercing.raw,
        this.actor?.system.offense.piercing.raw || 0,
      );
    }
    return piercing;
  }

  /**
   * Determines if vitals are being targeted.
   * @param {Teriock.Execution.AbilityExecutionOptions} options
   * @param {AbilitySystem} sys - The source system data.
   * @returns {boolean}
   */
  #resolveVitals(options, sys) {
    if (options.vitals !== undefined) return options.vitals;
    const armamentVitals =
      this.armament?.system.vitals && sys.interaction === "attack";
    return sys.isContact && armamentVitals ? true : sys.targets.has("vitals");
  }

  /**
   * Determines if the execution is warded.
   * @param {Teriock.Execution.AbilityExecutionOptions} options
   * @param {AbilitySystem} sys - The source system data.
   * @returns {boolean}
   */
  #resolveWarded(options, sys) {
    if (options.warded !== undefined) return options.warded;
    const armamentWarded =
      this.armament?.system.warded &&
      ["attack", "block"].includes(sys.interaction);
    return sys.isContact && armamentWarded ? true : !!sys.warded;
  }

  /**
   * Replace `@h` with the heighten amount in strings.
   * @param {string} s
   * @returns {string}
   */
  _heightenString(s) {
    const regex = /@h(?![a-zA-Z])/g;
    if (regex.test(s)) {
      return s.replace(regex, (this.heightened || 0).toString());
    } else {
      return s;
    }
  }
}
