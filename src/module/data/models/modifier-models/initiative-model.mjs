import characterConfig from "../../../constants/config/character-config.mjs";
import { omit } from "../../../helpers/utils.mjs";
import { FormulaField } from "../../fields/_module.mjs";
import { CompetenceModel } from "../scaling-models/_module.mjs";
import { BaseModifierModel } from "./_module.mjs";

const { fields } = foundry.data;

export default class InitiativeModel extends BaseModifierModel {
  /** @inheritDoc */
  static get Execution() {
    return teriock.executions.activity.InitiativeExecution;
  }

  /** @inheritDoc */
  static defineSchema(options = {}) {
    return Object.assign(omit(super.defineSchema(options), ["score"]), {
      competence: new fields.EmbeddedDataField(CompetenceModel, { initial: { raw: 1 } }),
      raw: new FormulaField({ initial: characterConfig.defaults.initiative.bonus }),
    });
  }

  /** @inheritDoc */
  async use(options) {
    const source = this.actor.token?.combatant;
    if (!source) { return; }
    await super.use(Object.assign(options, { bonus: this.raw, source }));
  }
}
