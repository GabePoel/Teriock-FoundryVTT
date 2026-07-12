import { addTypesToFormula, formulaExists } from "../../helpers/formula.mjs";
import { getImage } from "../../helpers/path.mjs";
import { getName } from "../../helpers/utils.mjs";
import ArmamentExecution from "./armament-execution/armament-execution.mjs";

const { fields } = foundry.data;

/**
 * @property {boolean} consumeAmmunition
 * @property {boolean} inheritAmmunitionDamageTypes
 */
export default class EquipmentExecution extends ArmamentExecution {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.EXECUTIONS.Equipment"];

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      consumeAmmunition: new fields.BooleanField({ initial: false }),
      inheritAmmunitionDamageTypes: new fields.BooleanField({ initial: true }),
    });
  }

  /** @inheritDoc */
  constructor(data, options) {
    super(data, options);
    if (this.source.system.ammunition.enabled) {
      if (options.ammunition?.system.consumable) { this.ammunition = options.ammunition; }
      else {
        this.ammunition = this.actor?.equipment.find(e =>
          e.active && e.system.consumable && (e.system.equipmentType === this.source.system.ammunition.type)
        );
      }
    }
    this.updateSource({ formula: this._readyUpdatedFormula() });
  }

  /** @type {TeriockEquipment|null} */
  ammunition;

  /** @inheritDoc */
  get _dialogDocuments() {
    const docs = super._dialogDocuments;
    if (this.source.system.ammunition.enabled) {
      docs.push({
        document: this.ammunition,
        editable: true,
        label: _loc("TERIOCK.TERMS.EquipmentClasses.ammunition"),
        getChoices: () => this.actor?.equipment.filter(e => e.active && e.system.consumable) ?? [],
        update: ammunition => {
          this.ammunition = ammunition;
          this.updateSource({ formula: this._readyUpdatedFormula() });
        },
      });
    }
    return docs;
  }

  /** @inheritDoc */
  get _formPaths() {
    const paths = super._formPaths;
    if (this.source.system.ammunition.enabled && this.ammunition) {
      paths.push("consumeAmmunition");
      paths.push("inheritAmmunitionDamageTypes");
    }
    return paths;
  }

  /** @inheritDoc */
  get executionNames() {
    return [...super.executionNames, "Equipment"];
  }

  /** @inheritDoc */
  async _buildSourcePanel() {
    if (this.secret) {
      return {
        blocks: [],
        icon: TERIOCK.config.document.equipment.icon,
        image: getImage("equipment", this.source.system._source.equipmentType),
        name: _loc("TERIOCK.SYSTEMS.Armament.PANELS.unknown", { type: getName(this.source.system.equipmentType) }),
      };
    }
    return super._buildSourcePanel();
  }

  /** @inheritDoc */
  _readyUpdatedFormula() {
    const oldFormula = super._readyUpdatedFormula();
    if (
      this.inheritAmmunitionDamageTypes && this.source.system.ammunition.enabled
      && this.ammunition?.system.damage.types.size
    ) {
      const rawDamage = this.twoHanded
        ? this.source.system._source.damage.twoHanded
        : this.source.system._source.damage.base;
      const rawTypedDamage = addTypesToFormula(rawDamage, this.source.system.damage.types);
      const newTypedDamage = addTypesToFormula(rawTypedDamage, this.ammunition.system.damage.types);
      return oldFormula.replace(rawTypedDamage, newTypedDamage);
    }
    return oldFormula;
  }

  /** @inheritDoc */
  updateSource(changes = {}, options = {}) {
    const diff = super.updateSource(changes, options);
    if (("inheritAmmunitionDamageTypes" in diff)) {
      const formula = this._readyUpdatedFormula();
      Object.assign(diff, super.updateSource({ dealImpacts: formulaExists(formula), formula }, options));
    }
    return diff;
  }
}
