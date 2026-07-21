import * as executionMixins from "../_module.mjs";
import { FormulaField } from "../../../data/fields/_module.mjs";
import { PiercingModel } from "../../../data/models/_module.mjs";
import { BaseRoll, ThresholdRoll } from "../../../dice/rolls/_module.mjs";
import { addFormula, formulaExists } from "../../../helpers/formula.mjs";

const { fields } = foundry.data;

/**
 * Mixin for executions that can make an attack roll.
 * @param {typeof BaseExecution} Base
 */
export default function AttackExecutionMixin(Base) {
  return (
    /**
     * @extends {BaseExecution}
     * @mixes ThresholdExecution
     * @mixin
     * @property {PiercingModel} piercing
     * @property {Teriock.System.FormulaString} incurredAttackPenalty
     * @property {boolean} sb
     * @property {boolean} useArmament
     * @property {boolean} vitals
     * @property {boolean} warded
     * @property {number} existingAttackPenalty
     */
    class AttackExecution extends executionMixins.ThresholdExecutionMixin(Base) {
      /** @inheritDoc */
      static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.EXECUTIONS.Attack"];

      /** @inheritDoc */
      static defineSchema() {
        return Object.assign(super.defineSchema(), {
          consumeAmmunition: new fields.BooleanField({ initial: true }),
          existingAttackPenalty: new fields.NumberField({ initial: 0, integer: true, max: 0, nullable: false }),
          incurredAttackPenalty: new FormulaField({ deterministic: false, initial: "0" }),
          piercing: new fields.EmbeddedDataField(PiercingModel),
          sb: new fields.BooleanField({ label: "TERIOCK.SYSTEMS.BaseActor.FIELDS.offense.sb.label" }),
          useArmament: new fields.BooleanField(),
          vitals: new fields.BooleanField({ label: "TERIOCK.SYSTEMS.Armament.FIELDS.vitals.label" }),
          warded: new fields.BooleanField({ label: "TERIOCK.SYSTEMS.Attack.FIELDS.warded.label" }),
        });
      }

      /**
       * @param {object} [data]
       * @param {Teriock.Execution.AttackExecutionOptions} [options]
       */
      constructor(data = {}, options = {}) {
        super(data, options);
        this.armament = options.armament ? options.armament : this._determineDefaultArmament();
      }

      /** @type {TeriockEquipment|null} */
      ammunition;

      /** @type {TeriockArmament|null} */
      armament;

      /** @type {number} */
      attackPenalty;

      /** @type {TeriockToken|null} */
      executor;

      /** @type {boolean} */
      limb;

      /** @type {Teriock.System.FormulaString} */
      rootBonus = "";

      /** @type {Set<TeriockToken>} */
      targets;

      /**
       * Whether an armament's warded state carries over to this.
       * @returns {boolean}
       */
      get _armamentWardedApplies() {
        return this.isAttack;
      }

      /**
       * The attack penalty incurred before any armament is taken into account.
       * @returns {Teriock.System.FormulaString}
       */
      get _baseAttackPenalty() {
        return "0";
      }

      /**
       * Whether limbs are targeted before any armament is taken into account.
       * @returns {boolean}
       */
      get _baseLimb() {
        return false;
      }

      /**
       * The piercing level before any armament is taken into account.
       * @returns {Teriock.System.PiercingLevel}
       */
      get _basePiercing() {
        return this.actor?.system.offense.piercing.raw ?? 0;
      }

      /**
       * Whether vitals are targeted before any armament is taken into account.
       * @returns {boolean}
       */
      get _baseVitals() {
        return false;
      }

      /**
       * Whether this is warded before any armament is taken into account.
       * @returns {boolean}
       */
      get _baseWarded() {
        return false;
      }

      /** @inheritDoc */
      get _dialogDocuments() {
        const docs = super._dialogDocuments;
        if (this.isContact) {
          docs.push({
            document: this.armament,
            editable: true,
            label: _loc("TYPES.Item.armament"),
            getChoices: () => this.actor?.armaments.filter(a => a.active) ?? [],
            update: armament => this._updateArmament(armament),
          });
          if (this.armament?.system.ammunition?.enabled) {
            docs.push({
              document: this.ammunition,
              editable: true,
              label: _loc("TERIOCK.TERMS.EquipmentClasses.ammunition"),
              getChoices: () => this.actor?.equipment.filter(e => e.system.consumable) ?? [],
              update: ammunition => this.ammunition = ammunition,
            });
          }
        }
        return docs;
      }

      /** @inheritDoc */
      get _formPaths() {
        return [
          "competence.raw",
          ...this._preAttackFormPaths,
          ...super._formPaths.filter(p => p !== "competence.raw"),
          ...this._postAttackFormPaths,
        ];
      }

      /**
       * Form paths shown after the shared threshold paths.
       * @returns {string[]}
       */
      get _postAttackFormPaths() {
        const paths = [];
        if (this.isAttack) { paths.push("sb", "vitals"); }
        paths.push("warded");
        if (this.isContact && this.armament?.system.ammunition?.enabled && this.ammunition) {
          paths.push("consumeAmmunition");
        }
        return paths;
      }

      /**
       * Form paths shown before the shared threshold paths.
       * @returns {string[]}
       */
      get _preAttackFormPaths() {
        const paths = [];
        if (this.isAttack) {
          paths.push("piercing.raw", "existingAttackPenalty");
          if (this.actor) { paths.push("incurredAttackPenalty"); }
        }
        return paths;
      }

      /** @inheritDoc */
      get flavor() {
        if (!this.isAttack) { return super.flavor; }
        let flavor = _loc("TERIOCK.ROLLS.Attack.label");
        if (this.piercing.ub) { flavor = _loc("TERIOCK.EXECUTIONS.Attack.FLAVOR.ub", { flavor }); }
        if (this.warded) { flavor = _loc("TERIOCK.EXECUTIONS.Attack.FLAVOR.warded", { flavor }); }
        return flavor;
      }

      /**
       * If this is an attack interaction.
       * @returns {boolean}
       */
      get isAttack() {
        return true;
      }

      /**
       * Does this require physical contact with the target?
       * @returns {boolean}
       */
      get isContact() {
        return this.useArmament;
      }

      /** @inheritDoc */
      get isRoll() {
        return this.isAttack;
      }

      /** @inheritDoc */
      async _buildRolls() {
        if (!this.isAttack) { return super._buildRolls(); }
        const styles = { dice: { classes: "attack" }, total: { classes: "attack" } };
        const generalRollOptions = { flavor: this.flavor, styles, targets: [] };
        if (this.piercing.ub) {
          generalRollOptions.styles.dice.icon = TERIOCK.display.icons.piercing.ub;
          generalRollOptions.styles.dice.classes += " ub";
          generalRollOptions.styles.dice.tooltip = _loc("TERIOCK.TERMS.Properties.unblockable");
        }
        for (const target of this.targets) {
          const rollOptions = foundry.utils.deepClone(generalRollOptions);
          rollOptions.targets = [target];
          if (target.actor) {
            rollOptions.threshold = target.actor.system.defense.cc;
            rollOptions.comparison = "gte";
            if (this.piercing.ub && (this.warded || !target.actor.system.wielding.blocker?.system.spellTurning)) {
              rollOptions.threshold = target.actor.system.defense.ac;
              rollOptions.comparison = "gt";
            }
            if (this.limb) { rollOptions.threshold += TERIOCK.config.system.target.limb; }
            else if (this.vitals) { rollOptions.threshold += TERIOCK.config.system.target.vitals; }
          }
          this.rolls.push(new ThresholdRoll(this.formula, this.getRollData(), rollOptions));
        }
        if (this.rolls.length === 0) {
          this.rolls.push(new ThresholdRoll(this.formula, this.getRollData(), generalRollOptions));
        }
      }

      /** @inheritDoc */
      async _buildTags() {
        await super._buildTags();
        if (this.isAttack) {
          if (this.piercing.av0) { this.tags.push(this.piercing.label); }
          if (this.sb) { this.tags.push(_loc("TERIOCK.SHEETS.Actor.SIDEBAR.BattleBox.sb.label")); }
        }
        if (this.warded) { this.tags.push(_loc("TERIOCK.SYSTEMS.Attack.FIELDS.warded.label")); }
        if (this.vitals) { this.tags.push(_loc("TERIOCK.TERMS.Targets.vitals")); }
      }

      /**
       * Logic to pick the ammunition this attacks with.
       */
      _determineDefaultAmmunition() {
        if (!this.isContact || !this.armament?.system.ammunition?.enabled) { return; }
        const type = this.armament.system.ammunition.type;
        this.ammunition = this.actor?.equipment.find(e =>
          e.active && e.system.consumable && (e.system.equipmentType === type)
        );
        // Fall back to inactive ammunition
        if (!this.ammunition) {
          this.ammunition = this.actor?.equipment.find(e => e.system.consumable && (e.system.equipmentType === type));
        }
      }

      /**
       * Logic to pick the armament this attacks with.
       * @returns {TeriockArmament|null}
       */
      _determineDefaultArmament() {
        return this.actor?.system.wielding.attacker ?? null;
      }

      /**
       * Resolves piercing by comparing the base value, armament, and actor offense.
       * @param {Teriock.Execution.AttackExecutionOptions} [options]
       * @returns {Teriock.System.PiercingLevel}
       */
      _determinePiercing(options = {}) {
        if (options.piercing !== undefined) { return options.piercing; }
        let raw = this._basePiercing;
        if (this.armament && this.isContact) {
          raw = Math.max(raw, this.armament.system.piercing.raw, this.actor?.system.offense.piercing.raw || 0);
        }
        return raw;
      }

      /**
       * Determine targets.
       * @returns {Promise<void>}
       */
      async _getTargets() {
        for (const target of game.user.targets) { this.targets.add(target); }
      }

      /** @inheritDoc */
      async _improveFormula() {
        if (this.isAttack) {
          if (this.piercing.av0) { this.formula = addFormula(this.formula, "@av0"); }
          if (this.sb) { this.formula = addFormula(this.formula, "@sb"); }
        }
        await super._improveFormula();
      }

      /** @inheritDoc */
      async _postInput() {
        const out = await super._postInput();
        await this._getTargets();
        return out;
      }

      /**
       * Prepare ammunition to be consumed.
       */
      _prepareAmmunitionConsumption() {
        if (this.isContact && this.consumeAmmunition && this.ammunition?.system.consumable) {
          this.operations.push({
            action: "update",
            documentName: "Item",
            parent: this.ammunition.parent,
            updates: [{
              _id: this.ammunition.id,
              system: {
                quantity: Math.max(
                  0,
                  this.ammunition.system.quantity
                    - (this.armament?.system.ammunition.consumptionAmount ?? this.ammunition.system.consumptionAmount),
                ),
              },
            }],
          });
        }
      }

      /**
       * Prepare the attack penalty that making this attack incurs.
       * @returns {Promise<void>}
       */
      async _prepareAttackPenalty() {
        if (this.isAttack && formulaExists(this.incurredAttackPenalty)) {
          this.attackPenalty = await BaseRoll.getValue(this.incurredAttackPenalty, this.getRollData());
        } else { this.attackPenalty = 0; }
      }

      /** @inheritDoc */
      async _prepareBaseFormula() {
        await super._prepareBaseFormula();
        if (this.isAttack) { this.formula = addFormula(this.formula, "@ap"); }
      }

      /** @inheritDoc */
      async _prepareUpdates() {
        await this._prepareAttackPenalty();
        this._prepareAmmunitionConsumption();
        if (this.actor && this.isAttack) {
          this.actorUpdates["system.combat.attackPenalty"] = this.actor.system.combat.attackPenalty
            + this.attackPenalty;
        }
        return super._prepareUpdates();
      }

      /**
       * Determines the formula for attack penalties.
       * @param {Teriock.Execution.AttackExecutionOptions} [options]
       * @returns {Teriock.System.FormulaString}
       */
      _resolveAttackPenalty(options = {}) {
        if (options.attackPenalty !== undefined) { return options.attackPenalty; }
        if (!this.isAttack) { return "0"; }
        return this.isContact && this.armament ? this.armament.system.attackPenalty : this._baseAttackPenalty;
      }

      /**
       * Determines if limbs are being targeted.
       * @param {Teriock.Execution.AttackExecutionOptions} [options]
       * @returns {boolean}
       */
      _resolveLimb(options = {}) {
        if (options.limb !== undefined) { return options.limb; }
        return this.isContact && this._baseLimb;
      }

      /**
       * Determines if vitals are being targeted.
       * @param {Teriock.Execution.AttackExecutionOptions} [options]
       * @returns {boolean}
       */
      _resolveVitals(options = {}) {
        if (options.vitals !== undefined) { return options.vitals; }
        const armamentVitals = this.armament?.system.vitals && this.isAttack;
        return this.isContact && armamentVitals ? true : this._baseVitals;
      }

      /**
       * Determines if the execution is warded.
       * @param {Teriock.Execution.AttackExecutionOptions} [options]
       * @returns {boolean}
       */
      _resolveWarded(options = {}) {
        if (options.warded !== undefined) { return options.warded; }
        const armamentWarded = (this.armament?.system.warded && this._armamentWardedApplies)
          || this.actor?.system.offense.warded;
        return this.isContact && armamentWarded ? true : this._baseWarded;
      }

      /**
       * Update the armament and re-derive dependent execution values.
       * @param {TeriockArmament|null} armament
       * @param {Teriock.Execution.AttackExecutionOptions} [options]
       */
      _updateArmament(armament, options = {}) {
        this.armament = armament ?? null;
        this._determineDefaultAmmunition();
        const changes = {
          incurredAttackPenalty: this._resolveAttackPenalty(options),
          "piercing.raw": this._determinePiercing(options),
          sb: Boolean(options.sb ?? ((this.armament && this.isContact) ? this.actor?.system.offense.sb : false)),
          vitals: this._resolveVitals(options),
          warded: this._resolveWarded(options),
        };
        if (this.isAttack && this.isContact) {
          const hitBonus = this.armament?.system.hitBonus;
          changes.bonus = formulaExists(this.rootBonus)
            ? (formulaExists(hitBonus) ? addFormula(this.rootBonus, hitBonus) : this.rootBonus)
            : (formulaExists(hitBonus) ? hitBonus : "0");
        }
        this.updateSource(changes);
      }

      /** @inheritDoc */
      getRollData() {
        return Object.assign(super.getRollData(), {
          ap: this.existingAttackPenalty,
          av0: Number(this.piercing.av0) * 2,
          "av0.wep": Number(this.armament?.system.piercing.av0) * 2,
          c: this.competence.fluent
            ? this.actor?.system.scaling.f
            : (this.competence.proficient ? this.actor?.system.scaling.p : 0),
          hit: this.armament?.system.hitBonus ?? 0,
          "hit.wep": this.armament?.system.hitBonus ?? 0,
          sb: this.sb ? this.actor?.system.scaling.p ?? 0 : 0,
          ub: Number(this.piercing.ub),
          "ub.wep": Number(this.armament?.system.piercing.ub),
          warded: Number(this.warded),
          "warded.wep": Number(this.armament?.system.warded),
        });
      }

      /** @inheritDoc */
      getScope(scope = {}) {
        return Object.assign(super.getScope(scope), { armament: this.armament });
      }

      /**
       * Initialize this execution from a set of options.
       * @param {Teriock.Execution.AttackExecutionOptions} [options]
       */
      initializeExecution(options = {}) {
        this._updateArmament(this.armament, options);
        if (!this.bonus) { this.updateSource({ bonus: "0" }); }
        this.limb = this._resolveLimb(options);
        this.executor = (game.canvas?.tokens.controlled ?? []).find(t => t.actor?.uuid === this.actor?.uuid)
          ?? this.actor?.defaultToken ?? null;
        let existingAttackPenalty = Number(this.actor?.system.combat.attackPenalty);
        if (Number.isNaN(existingAttackPenalty)) { existingAttackPenalty = 0; }
        this.updateSource({ existingAttackPenalty: Math.min(existingAttackPenalty, 0) });
        this.targets = new Set();
      }
    }
  );
}
