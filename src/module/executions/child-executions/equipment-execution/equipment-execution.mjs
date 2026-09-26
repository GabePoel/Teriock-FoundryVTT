import { addTypesToFormula, formulaExists } from "../../../helpers/formula.mjs";
import { getName, prefixObject } from "../../../helpers/utils.mjs";
import ArmamentExecution from "../armament-execution/armament-execution.mjs";

const { fields } = foundry.data;

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
  constructor(data = {}, options = {}) {
    data.consumeAmmunition ??= options.source.system.settings.getSetting("consumeAmmunition");
    super(data, options);
    if (this.source.system.ammunition.enabled) {
      if (options.ammunition?.system.consumable) { this.ammunition = options.ammunition; }
      else {
        this.ammunition = this.actor?.previewedTypes.equipment.find(e =>
          e.active && e.system.consumable && (e.system.equipmentType === this.source.system.ammunition.type)
        );
        // Fall back to inactive ammunition
        if (!this.ammunition) {
          this.ammunition = this.actor?.previewedTypes.equipment.find(e =>
            e.system.consumable && (e.system.equipmentType === this.source.system.ammunition.type)
          );
        }
      }
    }
    this.updateSource({ formula: this._readyUpdatedFormula() });
  }

  /** @type {TeriockItem<"equipment">|null} */
  ammunition;

  /** @inheritDoc */
  get _dialogDocuments() {
    const docs = super._dialogDocuments;
    if (this.source.system.ammunition.enabled) {
      docs.push({
        document: this.ammunition,
        editable: true,
        label: _loc("TERIOCK.TERMS.EquipmentClasses.ammunition"),
        getChoices: () => this.actor?.previewedTypes.equipment.filter(e => e.system.consumable) ?? [],
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
      if (this.dealImpacts) { paths.push("inheritAmmunitionDamageTypes"); }
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
      if (referenceEquipment) { return await referenceEquipment.getPanelParts(); }
      return {
        blocks: [],
        icon: TERIOCK.config.document.equipment.icon,
        img: game.teriock.identifiers.getImg(this.source.system.equipmentType)
          ?? TERIOCK.display.thumbnails.manifest.document.equipment,
        name: getName(this.source.system.equipmentType),
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
  getRollData() {
    const rollData = super.getRollData();
    if (this.source.system.ammunition.enabled && this.ammunition) {
      Object.assign(rollData, prefixObject(this.ammunition.system.getLocalRollData(), "ammunition"));
    }
    return rollData;
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
