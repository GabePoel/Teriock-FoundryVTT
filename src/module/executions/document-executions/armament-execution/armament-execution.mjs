import { selectDocumentsDialog } from "../../../applications/dialogs/_module.mjs";
import { TypeCollection } from "../../../documents/collections/_module.mjs";
import { addFormula, formulaExists } from "../../../helpers/formula.mjs";
import * as executionMixins from "../../mixins/_module.mjs";
import BaseDocumentExecution from "../base-document-execution/base-document-execution.mjs";

const { fields } = foundry.data;

/**
 * @implements {Teriock.Execution.ArmamentExecutionInterface}
 * @mixes ImpactsExecution
 * @param {HarmRoll[]} rolls
 */
export default class ArmamentExecution extends executionMixins.ImpactsExecutionMixin(BaseDocumentExecution) {
  /**
   * @param {Teriock.Execution.ArmamentExecutionOptions} options
   */
  constructor(options = {}) {
    super(options);
    this.impacts = new Set(options.impacts ?? Array.from(this.source.system.impacts) ?? ["damage"]);
    this.bonus = options.bonus ?? "";
    this.secret = options.secret ?? this.source.system.settings.getSetting("rollSecretly");
    this.twoHanded = this.source.system.hasTwoHandedAttack
      && (options.twoHanded ?? this.source.system.settings.getSetting("rollTwoHanded"));
    this.formula = options.formula
      ?? (this.twoHanded ? this.source.system.damage.twoHanded : this.source.system.damage.base);
    this.#dealImpacts = formulaExists(this.formula);
  }

  /** @type {boolean} */
  #dealImpacts;

  /** @type {boolean} */
  #useAbilities = true;

  /** @inheritDoc */
  get _dialogFields() {
    return [...super._dialogFields, {
      classes: ["slim"],
      field: new fields.BooleanField(),
      hint: "TERIOCK.SETTINGS.armament.rollSecretly.hint",
      label: "TERIOCK.SETTINGS.armament.rollSecretly.name",
      name: "secret",
      small: true,
      value: Boolean(this.secret),
      update: v => (this.secret = v),
    }, {
      classes: ["slim"],
      field: new fields.BooleanField(),
      hint: "TERIOCK.SETTINGS.armament.rollTwoHanded.hint",
      label: "TERIOCK.SETTINGS.armament.rollTwoHanded.name",
      name: "twoHanded",
      small: true,
      value: Boolean(this.twoHanded),
      condition: () => this.hasFormula && this.source.system.hasTwoHandedAttack,
      update: v => {
        this.twoHanded = v;
        this.formula = this.twoHanded ? this.source.system.damage.twoHanded : this.source.system.damage.base;
        this.#dealImpacts = formulaExists(this.formula);
      },
    }, {
      classes: ["slim"],
      field: new fields.BooleanField(),
      hint: "TERIOCK.SYSTEMS.Armament.EXECUTION.dealImpacts.hint",
      label: "TERIOCK.SYSTEMS.Armament.EXECUTION.dealImpacts.label",
      name: "dealImpacts",
      small: true,
      value: this.#dealImpacts,
      update: v => (this.#dealImpacts = v),
    }, {
      classes: ["slim"],
      condition: this.source.system.onUseAbilities.length > 0,
      field: new fields.BooleanField(),
      hint: "TERIOCK.SYSTEMS.Armament.EXECUTION.useAbilities.hint",
      label: "TERIOCK.SYSTEMS.Armament.EXECUTION.useAbilities.label",
      name: "useAbilities",
      small: true,
      value: this.#useAbilities,
      update: v => (this.#useAbilities = v),
    }];
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
    return this.#dealImpacts;
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
      for (const impact of this.impacts) {
        if (this._hasBoostForImpact(impact)) { this.boosts = Math.max(this.boosts, this._boostsResolved[impact]); }
      }
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
    if (this.#useAbilities && onUseAbilities.length > 0) {
      const usedAbilities = await selectDocumentsDialog(onUseAbilities, {
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
    this._applyImpactModifiers();
    if (formulaExists(this.bonus)) { this.formula = addFormula(this.formula, this.bonus); }
  }

  /** @inheritDoc */
  getScope(scope = {}) {
    return Object.assign(super.getScope(scope), { armament: this.source });
  }
}
