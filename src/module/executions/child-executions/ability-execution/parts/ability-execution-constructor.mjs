import { FormulaField } from "../../../../data/fields/_module.mjs";
import { PiercingModel } from "../../../../data/models/_module.mjs";
import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { addFormula, formulaExists } from "../../../../helpers/formula.mjs";
import { DocumentExecution } from "../../../abstract/_module.mjs";
import * as executionMixins from "../../../mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @extends {DocumentExecution}
 * @mixes ThresholdExecution
 * @property {boolean} consumeAmmunition
 * @property {boolean} consumeEquipment
 * @property {number} existingAttackPenalty
 * @property {Teriock.System.FormulaString} incurredAttackPenalty
 * @property {boolean} payCosts
 * @property {PiercingModel} piercing
 * @property {boolean} sb
 * @property {boolean} usesReaction
 * @property {boolean} vitals
 * @property {boolean} warded
 */
export default class AbilityExecutionConstructor extends executionMixins.ThresholdExecutionMixin(DocumentExecution) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.EXECUTIONS.Ability"];

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      consumeAmmunition: new fields.BooleanField({ initial: true }),
      consumeEquipment: new fields.BooleanField({ initial: false }),
      existingAttackPenalty: new fields.NumberField({ initial: 0, integer: true, max: 0, nullable: false }),
      incurredAttackPenalty: new FormulaField({ deterministic: false, initial: "0" }),
      payCosts: new fields.BooleanField(),
      piercing: new fields.EmbeddedDataField(PiercingModel),
      sb: new fields.BooleanField({ label: "TERIOCK.SYSTEMS.BaseActor.FIELDS.offense.sb.label" }),
      usesReaction: new fields.BooleanField(),
      vitals: new fields.BooleanField({ label: "TERIOCK.SYSTEMS.Armament.FIELDS.vitals.label" }),
      warded: new fields.BooleanField({ label: "TERIOCK.SYSTEMS.Attack.FIELDS.warded.label" }),
    });
  }

  /**
   * @param {object} [data]
   * @param {Teriock.Execution.AbilityExecutionOptions} [options]
   */
  constructor(data = {}, options = {}) {
    super(data, options);
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
   * @returns {Teriock.System.PiercingLevel}
   */
  #determinePiercing(options = {}) {
    let raw = this.source.system.piercing.raw;
    if (this.armament && this.source.system.isContact) {
      raw = Math.max(raw, this.armament.system.piercing.raw, this.actor?.system.offense.piercing.raw || 0);
    }
    if (options.piercing !== undefined) { raw = options.piercing; }
    return raw;
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
    this.costs = { gp: 0, hp: 0, lp: 0, mp: 0 };
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

  /** @type {TeriockEquipment|null} */
  ammunition;

  /** @type {TeriockArmament} */
  armament;

  /** @type {number} */
  attackPenalty;

  /** @type {Record<Teriock.Keys.PrimaryCost, number>} */
  costs;

  /** @type {TeriockToken|null} */
  executor;

  /** @type {number} */
  heightened;

  /** @type {boolean} */
  noHeighten;

  /** @type {Set<TeriockToken>} */
  targets;

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
      e.competencies.has(this.competence.raw) && e.checkIfQualified(this.getRollData())
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
    return this.source.system.targets.some((t) => TERIOCK.config.ability.targets[t]?.targetsActor);
  }

  /**
   * Whether this targets an armament.
   * @returns {boolean}
   */
  get targetsArmament() {
    return this.source.system.targets.some((t) => TERIOCK.config.ability.targets[t]?.targetsArmament);
  }

  /**
   * Replace `@h` with the heightened amount in strings.
   * @param {string} formula
   * @returns {string}
   */
  _heightenString(formula) {
    return BaseRoll.replaceFormulaData(formula, { h: this.heightened });
  }

  /**
   * Update armament and re-derive dependent execution values.
   * @param {TeriockArmament|null} armament
   * @param {Teriock.Execution.AbilityExecutionOptions} [options]
   */
  _updateArmament(armament, options = {}) {
    this.armament = armament;
    const changes = {
      incurredAttackPenalty: this.#resolveAttackPenalty(),
      "piercing.raw": this.#determinePiercing(options),
      sb: Boolean(options.sb ?? ((this.armament && this.isContact) ? this.actor?.system.offense.sb : 0)),
      vitals: this.#resolveVitals(),
      warded: this.#resolveWarded(),
    };
    if (this.isAttack && this.isContact) {
      changes.bonus = formulaExists(this.rootBonus) && formulaExists(armament?.system.hitBonus)
        ? addFormula(this.rootBonus, armament.system.hitBonus)
        : (formulaExists(armament?.system.hitBonus)
          ? armament.system.hitBonus
          : (formulaExists(this.rootBonus) ? this.rootBonus : "0"));
    }
    if (this.isContact && armament?.system.ammunition?.enabled) {
      this.ammunition = this.actor?.equipment.find(e =>
        e.active && e.system.consumable && (e.system.equipmentType === armament.system.ammunition.type)
      );
    }
    this.updateSource(changes);
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

  /** @inheritDoc */
  getRollData() {
    return Object.assign(super.getRollData(), {
      "angle.dragon": game.settings.get("teriock", "defaultDragonBreathAngle"),
      "angle.normal": game.settings.get("teriock", "defaultConeAngle"),
      ap: this.existingAttackPenalty,
    });
  }

  /**
   * Initialize this execution from a set of options.
   * @param {Teriock.Execution.AbilityExecutionOptions} options
   */
  initializeExecution(options = {}) {
    this.noHeighten = options.noHeighten ?? !this.source.system.settings.getSetting("promptHeighten");
    this.#initializeCosts(options);
    this._updateArmament(this.armament, options);
    if (!this.bonus) { this.updateSource({ bonus: "0" }); }
    this.limb = this.#resolveLimb(options);
    // Try and find a specific token that this is being executed by
    /** @type {TeriockToken[]} */
    const selectedTokens = game.canvas?.tokens.controlled ?? [];
    for (const t of selectedTokens) { if (t.actor?.uuid === this.actor.uuid) { this.executor = t; } }
    // Fall back to default token
    this.executor ??= this.actor?.defaultToken ?? null;
    let existingAttackPenalty = Number(this.actor?.system.combat.attackPenalty);
    if (Number.isNaN(existingAttackPenalty)) { existingAttackPenalty = 0; }
    this.updateSource({
      existingAttackPenalty: Math.min(existingAttackPenalty, 0),
      payCosts: game.settings.get("teriock", "autoPayAbilityCosts"),
      usesReaction: this.source.system.maneuver === "reactive" && this.source.system.executionTime.base === "r1",
    });
    this.targets = new Set();
  }
}
