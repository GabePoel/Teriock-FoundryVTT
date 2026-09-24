import { CostPayer } from "../../../applications/dialogs/_module.mjs";
import impactConfig from "../../../constants/config/impact-config.mjs";
import statConfig from "../../../constants/config/stat-config.mjs";
import { BaseAffinity } from "../../../data/pseudo-documents/affinities/abstract/_module.mjs";
import { ExecutionPseudoCollection } from "../../../data/pseudo-documents/collections/_module.mjs";
import { BaseExpiration } from "../../../data/pseudo-documents/expirations/abstract/_module.mjs";
import { BaseRoll } from "../../../dice/rolls/_module.mjs";
import { mixClasses } from "../../../helpers/construction.mjs";
import { addFormula } from "../../../helpers/formula.mjs";
import { objectMap, omit } from "../../../helpers/utils.mjs";
import { DocumentExecution } from "../../abstract/_module.mjs";
import { AttackExecutionMixin } from "../../mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @mixes AttackExecution
 */
export default class AbilityExecution extends mixClasses(DocumentExecution, AttackExecutionMixin) {
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
      preventAttack: new fields.BooleanField(),
      preventBlockCone: new fields.BooleanField(),
      preventFeat: new fields.BooleanField(),
      preventThreshold: new fields.BooleanField(),
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
    this.rootBonus = this.bonus;
    this.initializeExecution(options);
    this.affinities = new ExecutionPseudoCollection("affinities", this, this.source.system.affinities.values(), {
      documentClass: BaseAffinity,
    });
    this.expirations = new ExecutionPseudoCollection("expirations", this, this.source.system.expirations.values(), {
      documentClass: BaseExpiration,
    });
    const { duration, maneuver, targets } = this.source.system;
    this.updateSource({
      makeEffect: duration.unit !== "instant" && maneuver !== "passive",
      targetsActor: targets.some((t) => TERIOCK.config.ability.targets[t]?.targetsActor),
      targetsArmament: targets.some((t) => TERIOCK.config.ability.targets[t]?.targetsArmament),
    });
  }

  /**
   * Costs that are being paid.
   * @returns {string[]}
   */
  get #paidCosts() {
    return Object.keys(statConfig).filter(c => this.costs[c] > 0 && !this.options[`no${c.titleCase()}`]);
  }

  /**
   * Get the default effect duration.
   * @returns {Promise<undefined|number>}
   */
  async #getDuration() {
    const durationFormula = this.source.system.duration.formula;
    const durationValue = await BaseRoll.getValue(durationFormula, this.getRollData());
    return durationValue >= TERIOCK.config.system.inf / 10 ? undefined : durationValue;
  }

  /**
   * Prepare equipment to be consumed.
   */
  #prepareEquipmentConsumption() {
    if (this.isContact && this.consumeEquipment && this.armament?.system.consumable) {
      this.operations.push({
        action: "update",
        documentName: "Item",
        parent: this.armament.parent,
        updates: [{
          _id: this.armament.id,
          system: {
            quantity: {
              value: Math.max(0, this.armament.system.quantity.value - this.armament.system.consumptionAmount),
            },
          },
        }],
      });
    }
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

  /** @inheritDoc */
  get _postAttackFormPaths() {
    const paths = super._postAttackFormPaths;
    if (this.isContact && this.armament?.system.consumable) { paths.push("consumeEquipment"); }
    if (this.source.system.maneuver === "reactive") { paths.push("usesReaction"); }
    paths.push("autoPayCosts");
    return paths;
  }

  /** @inheritDoc */
  get _preAttackFormPaths() {
    const paths = super._preAttackFormPaths;
    if (this.isBlock) { paths.push("bv"); }
    return paths;
  }

  /** @returns {boolean} */
  get canHeighten() {
    return this.competence.proficient && Boolean(this.source.system.heightened) && !this.noHeighten
      && ((this.actor?.system.scaling.p ?? 0) > 0);
  }

  /** @inheritDoc */
  get competenceImprovesFormula() {
    return this.isAttack || this.isFeat;
  }

  /** @inheritDoc */
  get executionNames() {
    const names = [...super.executionNames, "Ability"];
    if (this.source.system.spell) { names.push("Spell"); }
    return names;
  }

  /** @inheritDoc */
  get flavor() {
    if (this.isAttack) { return super.flavor; }
    if (this.isFeat) { return _loc("TERIOCK.SYSTEMS.Ability.EXECUTION.flavor.feat"); }
    if (this.isBlock) { return _loc("TERIOCK.SYSTEMS.Ability.EXECUTION.flavor.block"); }
    return _loc("TERIOCK.SYSTEMS.Ability.EXECUTION.flavor.manifest");
  }

  /** @inheritDoc */
  get hasBonus() {
    return this.isAttack || this.isBlock || this.isFeat;
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
  get requiresCompetence() {
    return true;
  }

  /**
   * Whether a crit apply-effect variant should be generated by default.
   * True when crit result text exists, or any active mechanic is crit- or non-crit-only.
   * @returns {boolean}
   */
  get shouldMakeCritEffect() {
    const { results } = this.source.system;
    if (results.critHit || results.critMiss || results.critFail || results.critSave) { return true; }
    return [...this.affinities.active, ...this.automations.active, ...this.expirations.active].some(m =>
      m.crit instanceof Set && !(m.crit.has(0) && m.crit.has(1))
    );
  }

  /**
   * @inheritDoc
   * @returns {TeriockActiveEffect<"ability">}
   */
  get source() {
    return super.source;
  }

  /** @inheritDoc */
  async _buildActivations() {
    const acts = teriock.data.pseudoDocuments.activations;

    // Add feat save activation
    if (this.isFeat && !this.preventFeat) {
      const featOptions = { attribute: this.source.system.featSaveAttribute };
      if (!this.preventThreshold) { featOptions.threshold = this.rolls[0].total; }
      this.activations.push(new acts.FeatActivation({ options: featOptions }));
    }

    // Add block cone activation
    if (this.source.system.delivery === "cone" && !this.preventBlockCone) {
      this.activations.push(new acts.UseLocalActivation({ options: { lookup: "ability:block-cone" } }));
    }

    // Add all pre-defined activations
    return super._buildActivations();
  }

  /** @inheritDoc */
  async _buildRolls() {
    if (this.isAttack) {
      if (this.preventAttack) { return; }
      return super._buildRolls();
    }
    if ((this.isManifest && !this.targets.size) || (this.isFeat && this.preventThreshold)) { return; }
    const styles = {
      dice: { classes: [this.source.system.interaction] },
      total: { classes: [this.source.system.interaction] },
    };
    if (this.isFeat) { styles.total.icon = TERIOCK.display.icons.manifest.interaction.feat; }
    if (this.isBlock) { styles.total.icon = TERIOCK.display.icons.manifest.interaction.block; }
    const formula = this.isManifest ? "0" : this.formula;
    this.rolls.push(
      new BaseRoll(formula, this.getRollData(), {
        flavor: this.flavor,
        hideRoll: this.isManifest,
        styles,
        targets: Array.from(this.targets),
      }),
    );
  }

  /** @inheritDoc */
  async _buildSourcePanel() {
    const panel = await super._buildSourcePanel();
    if (!panel) { return panel; }
    const panelBlockStates = {
      "TERIOCK.SYSTEMS.Ability.FIELDS.heightened.label": this.heightened,
      "TERIOCK.SYSTEMS.Ability.FIELDS.overview.fluent.label": this.competence.fluent,
      "TERIOCK.SYSTEMS.Ability.FIELDS.overview.proficient.label": this.competence.proficient,
    };
    for (const [labelKey, active] of Object.entries(panelBlockStates)) {
      const panelBlock = panel.blocks.find(b => b.title === _loc(labelKey));
      if (!panelBlock) { continue; }
      if (active) { delete panelBlock.classes; }
      else { panelBlock.classes = [TERIOCK.display.panels.styles.faded]; }
    }
    return panel;
  }

  /** @inheritDoc */
  async _buildTags() {
    if (await super._buildTags() === false) { return false; }

    if (this.heightened > 0) {
      if (this.heightened === 1) { this.tags.push(_loc("TERIOCK.SYSTEMS.Applicable.PANELS.heightenedSingle")); }
      else { this.tags.push(_loc("TERIOCK.SYSTEMS.Applicable.PANELS.heightenedPlural", { value: this.heightened })); }
    }
    for (const c of Object.keys(this.costs).filter(c => this.costs[c] > 0)) {
      this.tags.push(
        _loc("TERIOCK.SYSTEMS.Applicable.PANELS.spent", { amount: this.costs[c], label: statConfig[c]?.abbreviation }),
      );
    }
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
    if (this.actor?.previewedTypes.ability?.some(a => a.active && a.system.identifier === "staff-touch")) {
      handPropertyIdentifiers.push("magelore");
    }
    armament = this._reselectArmamentForProperties(armament, "hand", handPropertyIdentifiers);
    armament = this._reselectArmamentForEquipmentClass(armament, "armor", "armor");
    armament = this._reselectArmamentForEquipmentClass(armament, "shield", "shields");
    return armament;
  }

  /**
   * Get user input on costs.
   * @returns {Promise<object|false>}
   */
  async _getCostInput() {
    const result = await CostPayer.prompt(this, { autoPay: this.autoPayCosts });
    if (result) {
      Object.assign(this.costs, result.costs);
      this.heightened = result.heightened;
    }
    return result;
  }

  /** @inheritDoc */
  async _getCriticalEffectData() {
    return foundry.utils.mergeObject(await this._getNormalEffectData(), {
      system: {
        affinities: this.affinities.active.filter(a => a?.crit.has(1)).map(a => a.toObject()),
        critical: true,
        expirations: this.expirations.active.filter(e => e?.crit.has(1)).map(e => e.toObject()),
      },
    });
  }

  /** @inheritDoc */
  _getEffectTypeData(type) {
    const data = super._getEffectTypeData(type);
    data.children = type === "consequence" ? this.source.subs.map(s => s.toObject()) : [];
    if (type === "consequence") { data.showIcon = 1; }
    return data;
  }

  /** @inheritDoc */
  async _getInput() {
    if (await super._getInput() === false) { return false; }
    if (await this._getCostInput() === false) { return false; }
  }

  /** @inheritDoc */
  async _getNormalEffectData() {
    return {
      changes: [],
      duration: { expiry: null, seconds: await this.#getDuration() },
      img: this.source.img,
      name: _loc("TERIOCK.SYSTEMS.Ability.EXECUTION.effectName", { name: this.source.name }),
      origin: this.source.uuid,
      showIcon: 0,
      system: {
        _src: this.source.uuid,
        affinities: this.affinities.active.filter(a => a?.crit.has(0)).map(a => a.toObject()),
        applyIfDeattuned: true,
        blocks: (await this.source.system.getPanelParts()).blocks,
        competence: { raw: this.competence.value },
        effectTypes: Array.from(this.source.system.effectTypes),
        elements: Array.from(this.source.system.elements),
        executor: this.actor?.uuid ?? null,
        expirations: this.expirations.active.filter(e => e?.crit.has(0)).map(e => e.toObject()),
        heightened: this.heightened,
        identifier: `${this.source.forcedIdentifier}-effect`,
        powerSources: Array.from(this.source.system.powerSources),
        sustained: this.source.system.sustained,
      },
    };
  }

  /** @inheritDoc */
  async _getTargets() {
    if (this.source.system.targets.size === 1 && this.source.system.targets.has("self") && this.executor) {
      this.targets.add(this.executor);
    } else { await super._getTargets(); }
  }

  /**
   * Replace `@h` with the heightened amount in strings.
   * @param {string} formula
   * @returns {string}
   */
  _heightenString(formula) {
    return BaseRoll.replaceFormulaData(formula, { h: this.heightened });
  }

  /** @inheritDoc */
  async _improveFormula() {
    if (this.competenceImprovesFormula && this.heightened > 0) {
      this.updateSource({ formula: addFormula(this.formula, "@h") });
    }
    return super._improveFormula();
  }

  /** @inheritDoc */
  async _performUpdates() {
    const yes = await super._performUpdates();
    if (yes === false) { return false; }

    if (this.actor) {
      for (const c of this.#paidCosts) {
        const config = statConfig[c];
        if (!config?.bar) { await impactConfig[config?.impact]?.apply(this.actor, this.costs[c]); }
      }
    }
  }

  /** @inheritDoc */
  async _postInput() {
    this.updateSource({ makeCritEffect: this.shouldMakeCritEffect });
    return super._postInput();
  }

  /** @inheritDoc */
  async _prepareBaseFormula() {
    if (this.isAttack) { return super._prepareBaseFormula(); }
    else if (this.isFeat) { this.updateSource({ formula: "10" }); }
    else if (this.isBlock) { this.updateSource({ formula: "10 + @av + @bv" }); }
    else { this.updateSource({ formula: "0" }); }
  }

  /** @inheritDoc */
  async _prepareUpdates() {
    this.#prepareEquipmentConsumption();
    if (this.actor) {
      if (this.usesReaction) { this.actorUpdates["system.combat.hasReaction"] = false; }
      for (const c of this.#paidCosts) {
        const config = statConfig[c];
        if (config?.bar) {
          this.actorUpdates[`system.${c}.value`] = Math.max(
            this.actor.system[c].value + (config?.multiplier ?? 1) * this.costs[c],
            this.actor.system[c].min ?? 0,
          );
        }
      }
    }
    return super._prepareUpdates();
  }

  /**
   * Find the armament that matches a certain equipment class.
   * @param {TeriockItem<"body"|"equipment">|null} armament
   * @param {Teriock.Keys.Delivery} delivery
   * @param {Teriock.Keys.Classification} equipmentClass
   * @returns {TeriockItem<"body"|"equipment">|null}
   */
  _reselectArmamentForEquipmentClass(armament, delivery, equipmentClass) {
    if (this.source.system.delivery === delivery && !armament?.system.equipmentClasses.has(equipmentClass)) {
      armament = this.actor.armaments.find(a => a.active && a.system.equipmentClasses.has(equipmentClass));
    }
    return armament;
  }

  /**
   * Find the armament that matches certain properties.
   * @param {TeriockItem<"body"|"equipment">|null} armament
   * @param {Teriock.Keys.Delivery} delivery
   * @param {Identifier[]} properties
   * @returns {TeriockItem<"body"|"equipment">|null}
   */
  _reselectArmamentForProperties(armament, delivery, properties) {
    if (
      this.source.system.delivery === delivery
      && !armament?.previewedTypes.property.some((p) => p.active && properties.includes(p.system.identifier))
    ) {
      armament = this.actor.armaments.find((a) =>
        a.active && a.previewedTypes.property.some(p => p.active && properties.includes(p.system.identifier))
      );
    }
    return armament;
  }

  /** @inheritDoc */
  _updateArmament(armament, options = {}) {
    super._updateArmament(armament, options);
    this.updateSource({ bv: this.armament?.system.bv.value });
  }

  /** @inheritDoc */
  getRollData() {
    return Object.assign(super.getRollData(), {
      "angle.dragon": game.settings.get("teriock", "defaultDragonBreathAngle"),
      "angle.normal": game.settings.get("teriock", "defaultConeAngle"),
      bv: this.bv ?? 0,
      h: this.heightened,
    });
  }

  /** @inheritDoc */
  getScope(scope = {}) {
    return Object.assign(super.getScope(scope), { ability: this.source });
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
