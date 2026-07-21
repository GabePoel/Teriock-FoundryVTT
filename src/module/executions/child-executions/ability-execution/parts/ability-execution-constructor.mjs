import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { addFormula, formulaExists } from "../../../../helpers/formula.mjs";
import { objectMap, omit } from "../../../../helpers/utils.mjs";
import { DocumentExecution } from "../../../abstract/_module.mjs";
import * as executionMixins from "../../../mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @extends {DocumentExecution}
 * @mixes AttackExecution
 * @property {boolean} consumeEquipment
 * @property {boolean} autoPayCosts
 * @property {boolean} noHeighten
 * @property {boolean} usesReaction
 */
export default class AbilityExecutionConstructor extends executionMixins.AttackExecutionMixin(DocumentExecution) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.EXECUTIONS.Ability"];

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(omit(super.defineSchema(), "useArmament"), {
      autoPayCosts: new fields.BooleanField(),
      bv: new fields.NumberField({
        initial: 0,
        integer: true,
        label: "TERIOCK.SYSTEMS.Armament.FIELDS.bv.raw.label",
        nullable: false,
      }),
      consumeEquipment: new fields.BooleanField({ initial: false }),
      noHeighten: new fields.BooleanField({ initial: false }),
      usesReaction: new fields.BooleanField(),
    });
  }

  /**
   * @param {object} [data]
   * @param {Teriock.Execution.AbilityExecutionOptions} [options]
   */
  constructor(data = {}, options = {}) {
    data.consumeAmmunition ??= options.source?.system.settings.getSetting("consumeAmmunition");
    super(data, options);
    const bonusAutomation = this.getAutomations("override", { active: true }).find(a => formulaExists(a.rollBonus));
    if (bonusAutomation) { this.updateSource({ bonus: addFormula(this.bonus, bonusAutomation.rollBonus) }); }
    this.rootBonus = this.bonus;
    this.initializeExecution(options);
  }

  /** @type {Record<Teriock.Keys.PrimaryCost, number>} */
  costs;

  /** @type {number} */
  heightened;

  /** @inheritDoc */
  get _armamentWardedApplies() {
    return ["attack", "block"].includes(this.source.system.interaction);
  }

  /** @inheritDoc */
  get _baseAttackPenalty() {
    return this.source.system.attackPenalty;
  }

  /** @inheritDoc */
  get _baseLimb() {
    const targets = this.source.system.targets;
    return targets.has("arm") || targets.has("leg") || targets.has("limb");
  }

  /** @inheritDoc */
  get _basePiercing() {
    return this.source.system.piercing.raw;
  }

  /** @inheritDoc */
  get _baseVitals() {
    return this.source.system.targets.has("vitals");
  }

  /** @inheritDoc */
  get _baseWarded() {
    return Boolean(this.source.system.warded);
  }

  /**
   * Active affinities.
   * @returns {Teriock.Affinities.Any[]}
   */
  get activeAffinities() {
    return this.source.system.affinities.contents.filter(a =>
      a.competencies.has(this.competence.raw) && a.checkIfQualified(this.getRollData())
      && ((a.heighten.has(0) && !this.heightened) || (a.heighten.has(1) && this.heightened))
    );
  }

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
   * Logic to pick armament based on interaction type.
   * @inheritDoc
   */
  _determineDefaultArmament() {
    if (!this.actor) { return null; }
    let armament;
    if (this.source.system.interaction === "attack") { armament = this.actor.system.wielding.attacker; }
    if (this.source.system.interaction === "block") { armament = this.actor.system.wielding.blocker; }
    armament = this._reselectArmamentForProperties(armament, "weapon", ["weapon"]);
    armament = this._reselectArmamentForProperties(armament, "bite", ["biting"]);
    const handPropertyIdentifiers = ["handy"];
    if (this.actor?.abilities.some(a => a.active && a.system.identifier === "staff-touch")) {
      handPropertyIdentifiers.push("magelore");
    }
    armament = this._reselectArmamentForProperties(armament, "hand", handPropertyIdentifiers);
    armament = this._reselectArmamentForEquipmentClass(armament, "armor", "armor");
    armament = this._reselectArmamentForEquipmentClass(armament, "shield", "shields");
    return armament;
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
   * Find the armament that matches a certain equipment class.
   * @param {TeriockArmament|null} armament
   * @param {Teriock.Keys.Delivery} delivery
   * @param {Teriock.Keys.EquipmentClass} equipmentClass
   * @returns {TeriockArmament|null}
   */
  _reselectArmamentForEquipmentClass(armament, delivery, equipmentClass) {
    if (this.source.system.delivery === delivery && !armament?.system.equipmentClasses.has(equipmentClass)) {
      armament = this.actor.armaments.find((a) => a.active && a.system.equipmentClasses.has(equipmentClass));
    }
    return armament;
  }

  /**
   * Find the armament that matches certain properties.
   * @param {TeriockArmament|null} armament
   * @param {Teriock.Keys.Delivery} delivery
   * @param {Identifier[]} properties
   * @returns {TeriockArmament|null}
   */
  _reselectArmamentForProperties(armament, delivery, properties) {
    if (
      this.source.system.delivery === delivery
      && !armament?.properties.some((p) => p.active && properties.includes(p.system.identifier))
    ) {
      armament = this.actor.armaments.find((a) =>
        a.active && a.properties.some(p => p.active && properties.includes(p.system.identifier))
      );
    }
    return armament;
  }

  /** @inheritDoc */
  _updateArmament(armament, options = {}) {
    super._updateArmament(armament, options);
    this.updateSource({ bv: this.armament?.system.bv.value });
  }

  /**
   * Get all the affinities of a given type.
   * @template {Teriock.Affinities.Type} T
   * @param {T} type
   * @param {object} [options]
   * @param {boolean} [options.active]
   * @param {boolean} [options.crit]
   * @returns {Teriock.Affinities.TypeMap[T][]}
   */
  getAffinities(type, options = {}) {
    const filter = (a) =>
      (a.type === type)
      && (typeof options.crit === "boolean"
        ? ((options.crit && a.crit.has(1)) || (!options.crit && a.crit.has(0)))
        : true);
    const { active } = options;
    if (active) { return this.activeAffinities.filter(filter); }
    return this.source.system.affinities.contents.filter(filter);
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
    });
  }

  /** @inheritDoc */
  initializeExecution(options = {}) {
    this.costs = objectMap(TERIOCK.config.stat, () => 0);
    super.initializeExecution(options);
    this.updateSource({
      autoPayCosts: this.source.system.settings.getSetting("autoPayCosts"),
      usesReaction: this.source.system.maneuver === "reactive" && this.source.system.executionTime.base === "r1",
    });
  }
}
