import { mergeMetadata, mixClasses, objectMap } from "../../../../utils/_module.mjs";
import FormulaField from "../../../fields/formula-field/formula-field.mjs";
import { migrateRename } from "../../../fields/tools/migrations.mjs";
import { RollActivation } from "../../activations/_module.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";
import { TriggerAutomationMixin } from "../mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @extends {BaseAutomation}
 * @mixes TriggerAutomation
 */
export default class RollAutomation extends mixClasses(BaseAutomation, TriggerAutomationMixin) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Roll"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { type: "roll" });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      command: new fields.StringField({
        choices: objectMap(TERIOCK.CONFIG.command, i => i.numeric?.deal, { localize: true, filter: c => c.numeric }),
        initial: "damage",
        nullable: false,
        required: true,
      }),
      formula: new FormulaField({ deterministic: false, nullable: true, placeholder: _loc("COMMON.None") }),
    });
  }

  /** @inheritDoc */
  static migrateData(source, options) {
    migrateRename(source, "impact", "command");
    return super.migrateData(source, options);
  }

  /** @inheritDoc */
  get _formPaths() {
    return ["command", "formula", "hr", ...this._triggerDisplayPaths];
  }

  /** @inheritDoc */
  async _getActivations(options = {}) {
    const formula = options?.execution?._resolveString(this.formula) ?? this.formula;
    if (formula && this.command) {
      return [new RollActivation({ command: this.command, formula })];
    }
    return [];
  }
}
