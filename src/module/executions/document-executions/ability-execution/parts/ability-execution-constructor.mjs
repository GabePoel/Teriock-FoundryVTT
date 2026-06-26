import { PiercingModel } from "../../../../data/models/_module.mjs";
import { addFormula, formulaExists } from "../../../../helpers/formula.mjs";
import * as executionMixins from "../../../mixins/_module.mjs";
import BaseDocumentExecution from "../../base-document-execution/base-document-execution.mjs";

/**
 * @extends {BaseDocumentExecution}
 * @mixes ThresholdExecution
 */
export default class AbilityExecutionConstructor
  extends executionMixins.ThresholdExecutionMixin(BaseDocumentExecution)
{
  /**
   * @param {Teriock.Execution.AbilityExecutionOptions} options
   */
  constructor(options = {}) {
    super(options);
    this.rootBonus = this.bonus;
    this.armament = options.armament ?? this.#determineDefaultArmament();
    this.initializeExecution(options);
  }

  /**
   * Logic to pick armament based on interaction type.
   * @returns {TeriockArmament|null}
   */
  #determineDefaultArmament() {
    if (!this.actor) { return null; }
    let armament;
    if (this.source.system.interaction === "attack") { armament = this.actor.system.wielding.attacker; }
    if (this.source.system.interaction === "block") { armament = this.actor.system.wielding.blocker; }
    if (this.source.system.delivery === "bite" && !armament?.properties.some((p) => p.system.identifier === "biting")) {
      armament = this.actor.armaments.find((a) => a.active && a.properties.some(p => p.system.identifier === "biting"));
    }
    if (
      this.source.system.delivery === "hand"
      && !armament?.properties.some((p) => ["handy", "magelore"].includes(p.system.identifier))
    ) {
      armament = this.actor.armaments.find((a) => a.active && a.properties.some(p => p.system.identifier === "handy"));
    }
    return armament;
  }

  /**
   * Resolves piercing by comparing source, armament, and actor offense.
   * @param {Teriock.Execution.AbilityExecutionOptions} options
   * @returns {PiercingModel}
   */
  #determinePiercing(options = {}) {
    this.piercing.raw = this.source.system.piercing.raw;
    if (this.armament && this.source.system.isContact) {
      this.piercing.raw = Math.max(
        this.piercing.raw,
        this.armament.system.piercing.raw,
        this.actor?.system.offense.piercing.raw || 0,
      );
    }
    if (options.piercing !== undefined) { this.piercing.raw = options.piercing; }
  }

  /**
   * Syncs cost options and initializes cost tracking.
   * @param {Teriock.Execution.AbilityExecutionOptions} options
   */
  #initializeCosts(options = {}) {
    Object.assign(this.options, {
      noGp: options.noGp ?? !this.source.system.settings.getSetting("promptCostGp"),
      noHp: options.noHp ?? !this.source.system.settings.getSetting("promptCostHp"),
      noLp: options.noLp ?? !this.source.system.settings.getSetting("promptCostLp"),
      noMp: options.noMp ?? !this.source.system.settings.getSetting("promptCostMp"),
    });
    this.costs = { gp: 0, hp: 0, mp: 0 };
  }

  /**
   * Determines the formula for attack penalties.
   * @param {Teriock.Execution.AbilityExecutionOptions} options
   * @returns {string}
   */
  #resolveAttackPenalty(options = {}) {
    if (options.attackPenalty !== undefined) { return options.attackPenalty; }
    if (!this.isAttack) { return "0"; }
    return this.isContact && this.armament ? this.armament.system.attackPenalty : this.source.system.attackPenalty;
  }

  /**
   * Determines if limbs are being targeted.
   * @param {Teriock.Execution.AbilityExecutionOptions} options
   * @returns {boolean}
   */
  #resolveLimb(options = {}) {
    const sys = this.source.system;
    if (options.limb !== undefined) { return options.limb; }
    return sys.isContact && (sys.targets.has("arm") || sys.targets.has("leg") || sys.targets.has("limb"));
  }

  /**
   * Determines if vitals are being targeted.
   * @param {Teriock.Execution.AbilityExecutionOptions} options
   * @returns {boolean}
   */
  #resolveVitals(options = {}) {
    if (options.vitals !== undefined) { return options.vitals; }
    const armamentVitals = this.armament?.system.vitals && this.source.system.interaction === "attack";
    return this.source.system.isContact && armamentVitals ? true : this.source.system.targets.has("vitals");
  }

  /**
   * Determines if the execution is warded.
   * @param {Teriock.Execution.AbilityExecutionOptions} options
   * @returns {boolean}
   */
  #resolveWarded(options = {}) {
    if (options.warded !== undefined) { return options.warded; }
    const armamentWarded =
      (this.armament?.system.warded && ["attack", "block"].includes(this.source.system.interaction))
      || this.actor?.system?.combat?.offense?.warded;
    return this.source.system.isContact && armamentWarded ? true : Boolean(this.source.system.warded);
  }

  /** @type {PiercingModel} */
  piercing = new PiercingModel();

  /** @inheritDoc */
  get activeAutomations() {
    return super.activeAutomations.filter(a =>
      (a.heighten.has(0) && !this.heightened) || (a.heighten.has(1) && this.heightened)
    );
  }

  /**
   * Active expirations.
   * @returns {Teriock.Expirations.Any[]}
   */
  get activeExpirations() {
    return this.source.system.expirations.contents.filter(e =>
      e.competencies.has(this.competence.raw) && e.checkIfQualified(this.rollData)
      && ((e.heighten.has(0) && !this.heightened) || (e.heighten.has(1) && this.heightened))
    );
  }

  /** @returns {boolean} */
  get canHeighten() {
    return this.competence.proficient && Boolean(this.source.system.heightened) && !this.noHeighten
      && (this.actor?.system.scaling.p ?? 0) > 0;
  }

  /** @inheritDoc */
  get executionNames() {
    const names = [...super.executionNames, "Ability"];
    if (this.source.system.spell) { names.push("Spell"); }
    return names;
  }

  /** @inheritDoc */
  get hasBonus() {
    return this.isAttack || this.isFeat;
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
  get rollData() {
    return Object.assign(super.rollData, {
      "angle.dragon": game.teriock.getSetting("defaultDragonBreathAngle"),
      "angle.normal": game.teriock.getSetting("defaultConeAngle"),
      ap: this.existingAttackPenalty,
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
   * Whether this targets an actor.
   * @returns {boolean}
   */
  get targetsActor() {
    const validTargets = ["creature", "vitals", "arm", "leg", "ability", "attack", "self", "other"];
    for (const t of validTargets) { if (this.source.system.targets.has(t)) { return true; } }
    return false;
  }

  /**
   * Whether this targets an armament.
   * @returns {boolean}
   */
  get targetsArmament() {
    const validTargets = ["armor", "item", "ship", "weapon"];
    for (const t of validTargets) { if (this.source.system.targets.has(t)) { return true; } }
    return false;
  }

  /**
   * Replace `@h` with the heightened amount in strings.
   * @param {string} s
   * @returns {string}
   */
  _heightenString(s) {
    const regex = /@h(?![a-zA-Z])/g;
    if (regex.test(s)) { return s.replace(regex, (this.heightened || 0).toString()); }
    return s;
  }

  /**
   * Update armament and re-derive dependent execution values.
   * @param {TeriockArmament|null} armament
   * @param {Teriock.Execution.AbilityExecutionOptions} [options]
   */
  _updateArmament(armament, options = {}) {
    this.armament = armament;
    const sys = this.source.system;
    this.#determinePiercing();
    this.sb = options.sb ?? Boolean(this.armament && sys.isContact) * (this.actor?.system.offense.sb ?? 0);
    this.vitals = this.#resolveVitals();
    this.warded = this.#resolveWarded();
    this.incurredAttackPenalty = this.#resolveAttackPenalty();
    if (this.isAttack && sys.isContact) {
      this.bonus = formulaExists(this.rootBonus) && formulaExists(armament?.system.hitBonus)
        ? addFormula(this.rootBonus, armament.system.hitBonus)
        : (formulaExists(armament?.system.hitBonus)
          ? armament.system.hitBonus
          : (formulaExists(this.rootBonus) ? this.rootBonus : "0"));
    }
  }

  /**
   * @inheritDoc
   * @template {Teriock.Automations.Type} T
   * @param {T} type
   * @param {object} [options]
   * @param {boolean} [options.active]
   * @param {boolean} [options.crit]
   * @returns {Teriock.Automations.TypeMap[T][]}
   */
  getAutomations(type, options = {}) {
    const automations = super.getAutomations(type, options);
    if (typeof options.crit === "boolean") {
      return automations.filter(a => (options.crit && a.crit?.has(1)) || (!options.crit && a.crit?.has(0)));
    }
    return automations;
  }

  /**
   * Get all the expirations of a given type.
   * @template {Teriock.Expirations.Type} T
   * @param {T} type
   * @param {object} [options]
   * @param {boolean} [options.active]
   * @param {boolean} [options.crit]
   * @returns {Teriock.Expirations.TypeMap[T][]}
   */
  getExpirations(type, options = {}) {
    const filter = (e) =>
      (e.type === type)
      && (typeof options.crit === "boolean"
        ? ((options.crit && e.crit.has(1)) || (!options.crit && e.crit.has(0)))
        : true);
    const { active } = options;
    if (active) { return this.activeExpirations.filter(filter); }
    return this.source.system.expirations.contents.filter(filter);
  }

  /**
   * Initialize this execution from a set of options.
   * @param {Teriock.Execution.AbilityExecutionOptions} options
   */
  initializeExecution(options = {}) {
    this.noHeighten = options.noHeighten ?? !this.source.system.settings.getSetting("promptHeighten");
    this.#initializeCosts(options);
    this._updateArmament(this.armament, options);
    if (!this.bonus) { this.bonus = "0"; }
    this.limb = this.#resolveLimb(options);
    // Try and find a specific token that this is being executed by
    /** @type {TeriockToken[]} */
    const selectedTokens = game.canvas?.tokens.controlled ?? [];
    for (const t of selectedTokens) { if (t.actor?.uuid === this.actor.uuid) { this.executor = t; } }
    // Fall back to default token
    this.executor ??= this.actor?.defaultToken ?? null;
    this.existingAttackPenalty = Number(this.actor?.system.combat.attackPenalty);
    if (Number.isNaN(this.existingAttackPenalty)) { this.existingAttackPenalty = 0; }
    this.usesReaction = this.source.system.maneuver === "reactive" && this.source.system.executionTime.base === "r1";
    this.payCosts = game.teriock.getSetting("autoPayAbilityCosts");
    this.targets = new Set();
  }
}
