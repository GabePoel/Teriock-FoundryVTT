import { FormulaField } from "../../../data/fields/_module.mjs";
import { getName, mixClasses } from "../../../utils/_module.mjs";
import { AmmunitionExecutionMixin } from "../../mixins/_module.mjs";
import ArmamentExecution from "../armament-execution/armament-execution.mjs";

const { fields } = foundry.data;

/**
 * @extends {ArmamentExecution}
 * @mixes AmmunitionExecution
 */
export default class EquipmentExecution extends mixClasses(ArmamentExecution, AmmunitionExecutionMixin) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.EXECUTIONS.Equipment"];

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      inheritAmmunitionDamageTypes: new fields.BooleanField({ initial: true }),
    });
  }

  /** @inheritDoc */
  get _ammunitionArmament() {
    return this.source;
  }

  /** @inheritDoc */
  get _dialogDocuments() {
    const docs = super._dialogDocuments;
    if (this._usesAmmunition) { docs.push(this._ammunitionDialogDocument); }
    return docs;
  }

  /** @inheritDoc */
  get _formPaths() {
    const paths = super._formPaths;
    if (this._usesAmmunition && this.ammunition) {
      paths.push("consumeAmmunition");
      if (this.dealCommands) { paths.push("inheritAmmunitionDamageTypes"); }
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
      const referenceEquipment = await teriock.fromIdentifier(this.source.system.equipmentType);
      if (referenceEquipment) { return referenceEquipment.getPanelParts(); }
      return {
        blocks: [],
        icon: this.source.system.metadata.icon,
        img: game.teriock.identifiers.getImg(this.source.system.equipmentType)
          ?? TERIOCK.DISPLAY.thumbnails.manifest.document.equipment,
        name: getName(this.source.system.equipmentType),
      };
    }
    return super._buildSourcePanel();
  }

  /**
   * @inheritDoc
   * @param {Teriock.Execution.ConstructionOptions<Teriock.Execution.EquipmentExecutionOptions>} [options]
   */
  _configure(options = {}) {
    super._configure(options);
    if (!this._usesAmmunition) { return; }
    this.ammunition = options.ammunition?.system?.consumption?.enabled
      ? options.ammunition
      : this.source.system.defaultAmmunition;
  }

  /**
   * @inheritDoc
   * @param {Teriock.Execution.ConstructionOptions<Teriock.Execution.EquipmentExecutionOptions>} [options]
   */
  _initialize(options = {}) {
    super._initialize(options);
    if (!("strict" in options)) { return; }
    this.updateSource({ formula: this._readyUpdatedFormula() });
  }

  /**
   * @inheritDoc
   * @param {Record<string, any>} data
   * @param {Teriock.Execution.ConstructionOptions<Teriock.Execution.EquipmentExecutionOptions>} [options]
   * @returns {Record<string, any>}
   */
  _initializeSource(data, options = {}) {
    data.consumeAmmunition ??= options.source.system.settings.getSetting("consumeAmmunition");
    return super._initializeSource(data, options);
  }

  /** @inheritDoc */
  _readyUpdatedFormula() {
    const oldFormula = super._readyUpdatedFormula();
    if (this.inheritAmmunitionDamageTypes && this._usesAmmunition && this.ammunition?.system.damage.types.size) {
      const rawDamage = this.twoHanded
        ? this.source.system._source.damage.twoHanded
        : this.source.system._source.damage.base;
      const rawTypedDamage = FormulaField.addTypes(rawDamage, this.source.system.damage.types);
      const newTypedDamage = FormulaField.addTypes(rawTypedDamage, this.ammunition.system.damage.types);
      return oldFormula.replace(rawTypedDamage, newTypedDamage);
    }
    return oldFormula;
  }

  /** @inheritDoc */
  _updateAmmunition(ammunition) {
    super._updateAmmunition(ammunition);
    this.updateSource({ formula: this._readyUpdatedFormula() });
  }

  /** @inheritDoc */
  updateSource(changes = {}, options = {}) {
    const diff = super.updateSource(changes, options);
    if (("inheritAmmunitionDamageTypes" in diff)) {
      const formula = this._readyUpdatedFormula();
      Object.assign(diff, super.updateSource({ dealCommands: FormulaField.exists(formula), formula }, options));
    }
    return diff;
  }
}
