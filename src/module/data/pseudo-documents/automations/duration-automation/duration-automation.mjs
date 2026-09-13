import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { mergeMetadata } from "../../../../helpers/construction.mjs";
import { FormulaField } from "../../../fields/_module.mjs";
import { TimeUnitModel } from "../../../models/unit-models/_module.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";

const { fields } = foundry.data;

export default class DurationAutomation extends BaseAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Duration"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { type: "duration" });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      duration: new fields.EmbeddedDataField(TimeUnitModel),
      substitution: new FormulaField({ initial: "@base + @new" }),
    });
  }

  /**
   * Duration in seconds determined while generating effect data.
   * @type {number}
   */
  #seconds = 0;

  /** @inheritDoc */
  get _formPaths() {
    return ["duration.unit", "duration.raw", "substitution", ...super._formPaths];
  }

  /** @inheritDoc */
  async interactOnExecutionEffectData(execution) {
    this.#seconds = await BaseRoll.getValue(this.duration.formula, execution.getRollData());
  }

  /** @inheritDoc */
  async modifyExecutionEffectData(execution, data) {
    await super.modifyExecutionEffectData(execution, data);
    const inf = TERIOCK.config.system.inf;
    const base = foundry.utils.getProperty(data, "duration.seconds") ?? inf;
    const formula = BaseRoll.replaceFormulaData(this.substitution, { base, new: this.#seconds });
    const seconds = await BaseRoll.getValue(formula, execution.getRollData());
    foundry.utils.setProperty(data, "duration.seconds", seconds >= inf / 10 ? undefined : seconds);
  }
}
