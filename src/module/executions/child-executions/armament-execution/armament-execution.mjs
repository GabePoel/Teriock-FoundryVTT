import { DocumentSelector } from "../../../applications/dialogs/_module.mjs";
import { TypeCollection } from "../../../documents/collections/_module.mjs";
import { addFormula, formulaExists } from "../../../helpers/formula.mjs";
import { DocumentExecution } from "../../abstract/_module.mjs";
import * as executionMixins from "../../mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @implements {Teriock.Execution.ArmamentExecutionInterface}
 * @mixes ImpactsExecution
 * @param {HarmRoll[]} rolls
 * @property {boolean} dealImpacts
 * @property {boolean} secret
 * @property {boolean} twoHanded
 * @property {boolean} useAbilities
 */
export default class ArmamentExecution extends executionMixins.ImpactsExecutionMixin(DocumentExecution) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.EXECUTIONS.Armament"];

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      dealImpacts: new fields.BooleanField(),
      secret: new fields.BooleanField({
        hint: "TERIOCK.SETTINGS.armament.rollSecretly.hint",
        label: "TERIOCK.SETTINGS.armament.rollSecretly.name",
      }),
      twoHanded: new fields.BooleanField({
        hint: "TERIOCK.SETTINGS.armament.rollTwoHanded.hint",
        label: "TERIOCK.SETTINGS.armament.rollTwoHanded.name",
      }),
      useAbilities: new fields.BooleanField({ initial: true }),
    });
  }

  /**
   * @param {object} [data]
   * @param {Teriock.Execution.ArmamentExecutionOptions} [options]
   */
  constructor(data = {}, options = {}) {
    const sys = options.source.system;
    data.secret ??= sys.settings.getSetting("rollSecretly");
    data.twoHanded = sys.hasTwoHandedAttack && (data.twoHanded ?? sys.settings.getSetting("rollTwoHanded"));
    data.formula ??= data.twoHanded ? sys.damage.twoHanded : sys.damage.base;
    data.dealImpacts ??= formulaExists(data.formula);
    data.impacts ??= Array.from(sys.impacts ?? ["damage"]);
    super(data, options);
    this.bonus = options.bonus ?? "";
  }

  /** @type {Teriock.System.FormulaString} */
  bonus = "";

  /** @inheritDoc */
  get _formPaths() {
    const paths = [...super._formPaths, "secret"];
    if (this.hasFormula && this.source.system.hasTwoHandedAttack) { paths.push("twoHanded"); }
    paths.push("dealImpacts");
    if (this.source.system.onUseAbilities.length > 0) { paths.push("useAbilities"); }
    return paths;
  }

  /** @inheritDoc */
  get automations() {
    const automations = [...this._automations];
    for (const p of this.source.properties) { automations.push(...p.system.automations.contents); }
    return new TypeCollection(automations.map(a => [a.id, a]));
  }

  /** @inheritDoc */
  get executionNames() {
    return [...super.executionNames, "Armament"];
  }

  /** @inheritDoc */
  get hasFormula() {
    return this.dealImpacts;
  }

  /** @inheritDoc */
  async _buildSourcePanel() {
    if (this.secret) {
      return {
        blocks: [],
        icon: TERIOCK.config.document[this.source.type]?.icon ?? this.icon,
        image: this.source.img,
        name: _loc("TERIOCK.SYSTEMS.Armament.PANELS.unknown", { type: _loc(`TYPES.Item.${this.source.type}`) }),
      };
    }
    return this.source.toPanel();
  }

  /** @inheritDoc */
  async _getInput() {
    if (this.showDialog) {
      let boosts = this.boosts;
      for (const impact of this.impacts) {
        if (this._hasBoostForImpact(impact)) { boosts = Math.max(boosts, this._boostsResolved[impact]); }
      }
      if (boosts !== this.boosts) { this.updateSource({ boosts }); }
    }
    return super._getInput();
  }

  /** @inheritDoc */
  _hasBoostForImpact(impact) {
    return (super._hasBoostForImpact(impact)
      || (this._boostsResolved[impact] && this.impacts.has(impact) && formulaExists(this.formula)));
  }

  /** @inheritDoc */
  async _postExecute() {
    const onUseAbilities = this.source.system.onUseAbilities;
    if (this.useAbilities && onUseAbilities.length > 0) {
      const usedAbilities = await DocumentSelector.selectMulti(onUseAbilities, {
        hint: _loc("TERIOCK.SYSTEMS.Equipment.DIALOG.onUse.hint", { name: this.source.name }),
        title: _loc("TERIOCK.SYSTEMS.Equipment.DIALOG.onUse.title"),
      });
      for (const ability of usedAbilities) {
        if (ability.system.consumable && this.source.system.consumable) {
          if (ability.system.quantity !== 1 && this.source.isOwner && !this.source.inCompendium) {
            await this.source.setFlag("teriock", "dontConsume", true);
          }
        }
        await ability.use({ ...this.options, armament: this.source });
      }
    }
    await super._postExecute();
  }

  /** @inheritDoc */
  async _prepareFormula() {
    if (!this.dealImpacts) { this.formula = ""; }
    this._applyImpactModifiers();
    if (formulaExists(this.bonus)) { this.formula = addFormula(this.formula, this.bonus); }
  }

  /**
   * Ready an updated formula.
   * @returns {Teriock.System.FormulaString}
   */
  _readyUpdatedFormula() {
    return this.twoHanded ? this.source.system.damage.twoHanded : this.source.system.damage.base;
  }

  /** @inheritDoc*/
  getScope(scope = {}) {
    return Object.assign(super.getScope(scope), { armament: this.source });
  }

  /** @inheritDoc */
  updateSource(changes = {}, options = {}) {
    const diff = super.updateSource(changes, options);
    if (("twoHanded" in diff)) {
      const formula = this._readyUpdatedFormula();
      Object.assign(diff, super.updateSource({ dealImpacts: formulaExists(formula), formula }, options));
    }
    return diff;
  }
}
