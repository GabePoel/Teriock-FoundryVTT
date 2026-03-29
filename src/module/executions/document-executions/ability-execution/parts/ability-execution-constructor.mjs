import { PiercingModel } from "../../../../data/models/_module.mjs";
import { addFormula, formulaExists } from "../../../../helpers/formula.mjs";
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
    this.sb =
      options.sb ??
      !!(this.armament && this.source.system.isContact) *
        (this.actor?.system.offense.sb ?? 0);
    this.#determinePiercing(options);
    this.warded = this.#resolveWarded(options, sys);
    this.vitals = this.#resolveVitals(options, sys);
    this.limb = this.#resolveLimb(options, sys);
    this.incurredAttackPenalty = this.#resolveAttackPenalty(options);
    this.executor = this.actor?.defaultToken ?? null;
    this.existingAttackPenalty = Number(
      this.actor?.system.combat.attackPenalty,
    );
    this.usesReaction =
      this.source.system.maneuver === "reactive" &&
      this.source.system.executionTime.base === "r1";
    this.targets = new Set();
    if (
      this.isAttack &&
      formulaExists(this.armament?.system.hit.formula) &&
      this.source.system.isContact
    ) {
      this.bonus = addFormula(this.bonus, this.armament.system.hit.formula);
    }
  }

  /** @type {PiercingModel} */
  piercing = new PiercingModel();

  /** @inheritDoc */
  get activeAutomations() {
    return super.activeAutomations.filter(
      (a) =>
        (a.heighten.has(0) && !this.heightened) ||
        (a.heighten.has(1) && this.heightened),
    );
  }

  /** @returns {boolean} */
  get canHeighten() {
    return (
      this.competence.proficient &&
      !!this.source.system.heightened &&
      !this.flags.noHeighten
    );
  }

  /** @inheritDoc */
  get executionNames() {
    const names = [...super.executionNames, "Ability"];
    if (this.source.system.spell) names.push("Spell");
    return names;
  }

  /** @inheritDoc */
  get hasBonus() {
    return this.isAttack || this.isFeat;
  }

  /** @inheritDoc */
  get icon() {
    return TERIOCK.display.icons.document.ability;
  }

  /**
   * If this is an attack interaction.
   * @returns {boolean}
   */
  get isAttack() {
    return this.source?.system.interaction === "attack";
  }

  /**
   * If this is a block interaction.
   * @return {boolean}
   */
  get isBlock() {
    return this.source?.system.interaction === "block";
  }

  /**
   * Does this require physical contact with the target?
   * @return {boolean}
   */
  get isContact() {
    return this.source.system.isContact;
  }

  /**
   * If this is a feat interaction.
   * @return {boolean}
   */
  get isFeat() {
    return this.source?.system.interaction === "feat";
  }

  /**
   * If this is a manifest interaction.
   * @return {boolean}
   */
  get isManifest() {
    return this.source?.system.interaction === "manifest";
  }

  /** @inheritDoc */
  get isRoll() {
    return this.isAttack;
  }

  /** @inheritDoc */
  get name() {
    return this.source.system.fullName;
  }

  /** @inheritDoc */
  get rollData() {
    return Object.assign(super.rollData, {
      ap: this.existingAttackPenalty,
      "angle.normal": game.teriock.getSetting("defaultConeAngle"),
      "angle.dragon": game.teriock.getSetting("defaultDragonBreathAngle"),
    });
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
   * Resolves piercing by comparing source, armament, and actor offense.
   * @param {Teriock.Execution.AbilityExecutionOptions} options
   * @returns {PiercingModel}
   */
  #determinePiercing(options) {
    this.piercing.raw = this.source.system.piercing.raw;
    if (this.armament && this.source.system.isContact) {
      this.piercing.raw = Math.max(
        this.piercing.raw,
        this.armament.system.piercing.raw,
        this.actor?.system.offense.piercing.raw || 0,
      );
    }
    if (options.piercing !== undefined) this.piercing.raw = options.piercing;
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
   * @returns {string}
   */
  #resolveAttackPenalty(options) {
    if (options.attackPenalty !== undefined) return options.attackPenalty;
    if (!this.isAttack) return "0";
    return this.isContact && this.armament
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
      (this.armament?.system.warded &&
        ["attack", "block"].includes(sys.interaction)) ||
      this.actor?.system?.combat?.offense?.warded;
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
