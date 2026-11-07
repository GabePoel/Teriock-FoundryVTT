import { mergeMetadata, omit } from "../../../utils/_module.mjs";
import { BaseModifierModel } from "./_module.mjs";

export default class InitiativeModifierModel extends BaseModifierModel {
  /**
   * @inheritDoc
   * @type {Teriock.Metadata.ModifierMetadata}
   */
  static metadata = mergeMetadata(super.metadata, {
    initialBase: TERIOCK.CONFIG.character.defaults.initiative.base,
    initialCompetence: TERIOCK.CONFIG.character.defaults.initiative.competence,
  });

  /** @inheritDoc */
  static get Execution() {
    return teriock.executions.activity.InitiativeExecution;
  }

  /** @inheritDoc */
  static defineSchema() {
    return omit(super.defineSchema(), ["score"]);
  }

  /** @inheritDoc */
  static migrateData(source, options) {
    if (source.bonus === this.metadata.initialBase) { source.bonus = ""; }
    return super.migrateData(source, options);
  }

  /** @inheritDoc */
  async use(options) {
    const roller = this.actor.defaultCombatant;
    if (!roller) { return; }
    await super.use(Object.assign(options, { roller, source: roller.group ?? roller }));
  }
}
