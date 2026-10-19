import characterConfig from "../../../static/config/character-config.mjs";
import { mergeMetadata, omit } from "../../../utils/_module.mjs";
import { rollableFormulaField } from "../../fields/tools/builders.mjs";
import { BaseModifierModel } from "./_module.mjs";

export default class InitiativeModel extends BaseModifierModel {
  /**
   * @inheritDoc
   * @type {Teriock.Metadata.ModelMetadata}
   */
  static metadata = mergeMetadata(super.metadata, { initialCompetence: 1 });

  /** @inheritDoc */
  static get Execution() {
    return teriock.executions.activity.InitiativeExecution;
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(omit(super.defineSchema(), ["score"]), {
      bonus: rollableFormulaField({ initial: characterConfig.defaults.initiative.bonus }),
    });
  }

  /** @inheritDoc */
  async use(options) {
    const roller = this.actor.defaultCombatant;
    if (!roller) { return; }
    await super.use(Object.assign(options, { bonus: this.bonus, roller, source: roller.group ?? roller }));
  }
}
