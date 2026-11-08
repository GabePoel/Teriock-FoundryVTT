import { BaseRoll } from "../../../../dice/rolls/_module.mjs";
import { mergeMetadata } from "../../../../utils/_module.mjs";
import { FormulaField, UnitField } from "../../../fields/_module.mjs";
import { EffectDurationUnitModel } from "../../../models/unit-models/_module.mjs";
import { BaseAutomation } from "../abstract/_module.mjs";

export default class DurationAutomation extends BaseAutomation {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Duration"];

  /** @inheritDoc */
  static metadata = mergeMetadata(super.metadata, { tags: { ability: true }, type: "duration" });

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      duration: new UnitField(EffectDurationUnitModel),
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
    return ["duration", "substitution", ...super._formPaths];
  }

  /** @inheritDoc */
  get makesEffectData() {
    return true;
  }

  /** @inheritDoc */
  async interactOnExecutionEffectData(execution) {
    this.#seconds = await BaseRoll.getValue(this.duration.formula, execution.getRollData());
  }

  /** @inheritDoc */
  async modifyExecutionEffectData(execution, data) {
    await super.modifyExecutionEffectData(execution, data);
    const inf = TERIOCK.CONST.INF;
    const base = foundry.utils.getProperty(data, "duration.seconds") ?? inf;
    const formula = BaseRoll.replaceFormulaData(this.substitution, { base, new: this.#seconds });
    const seconds = await BaseRoll.getValue(formula, execution.getRollData());
    foundry.utils.setProperty(data, "duration.seconds", seconds >= inf / 10 ? undefined : seconds);
  }
}
