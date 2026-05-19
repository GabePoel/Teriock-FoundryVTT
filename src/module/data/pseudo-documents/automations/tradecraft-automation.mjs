import { selectTradecraftDialog, selectTradecraftsDialog } from "../../../applications/dialogs/_module.mjs";
import { mixClasses } from "../../../helpers/construction.mjs";
import { migrateKey } from "../../shared/migrations/source-migrations.mjs";
import { TradecraftActivation } from "../activations/command-activations.mjs";
import { ThresholdAutomation } from "./abstract/_module.mjs";
import { CompetenceAutomationMixin, SelectAutomationMixin, TriggerAutomationMixin } from "./mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @extends {ThresholdAutomation}
 * @mixes SelectAutomation
 * @mixes TriggerAutomation
 * @mixes CompetenceAutomation
 */
export default class TradecraftAutomation extends mixClasses(
  ThresholdAutomation,
  SelectAutomationMixin,
  TriggerAutomationMixin,
  CompetenceAutomationMixin,
) {
  /** @inheritDoc */
  static LOCALIZATION_PREFIXES = [...super.LOCALIZATION_PREFIXES, "TERIOCK.AUTOMATIONS.Tradecraft"];

  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.ROLLS.Tradecraft.label";
  }

  /** @inheritDoc */
  static get triggerMetadata() {
    return Object.assign(super.triggerMetadata, { executionOnly: true });
  }

  /** @inheritDoc */
  static get TYPE() {
    return "tradecraft";
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      tradecrafts: new fields.SetField(
        new fields.StringField({
          choices: TERIOCK.reference.tradecrafts,
        }),
      ),
    });
  }

  /** @inheritDoc */
  static migrateData(source, options, state) {
    migrateKey(source, "tradecraft", "tradecrafts", v => [v]);
    return super.migrateData(source, options, state);
  }

  /** @inheritDoc */
  get _formPaths() {
    return [
      "tradecrafts",
      "hr",
      ...this._selectionOptionPaths,
      "hr",
      ...this._triggerPaths,
      "hr",
      "bonus",
      "threshold",
      ...this._competencePaths,
    ];
  }

  /** @inheritDoc */
  async _getActivations() {
    return Array.from(this.tradecrafts)
      .filter(Boolean)
      .map(
        tradecraft =>
          new TradecraftActivation({
            options: {
              bonus: this.bonus,
              competence: this.overrideCompetence ? this.competence.raw : this.document?.system?.competence?.raw,
              threshold: this.threshold,
              tradecraft,
            },
          }),
      );
  }

  /** @inheritDoc */
  async _preFire(scope) {
    await this.executeTradecraft(scope);
  }

  /**
   * Execute one selected tradecraft.
   * @param {Teriock.System.TriggerScope} scope
   * @returns {Promise<void>}
   */
  async executeTradecraft(scope = {}) {
    if (this.tradecrafts.size === 0) {
      return;
    }
    const choices = Array.from(this.tradecrafts);
    let selected = [];
    if (this.automatic && choices.length === 1) {
      selected = choices;
    } else {
      if (this.multi) {
        selected = await selectTradecraftsDialog(choices);
        if (selected.length === 0) {
          return;
        }
      } else {
        const chosen = await selectTradecraftDialog(choices);
        if (!chosen) {
          return;
        }
        selected = [chosen];
      }
    }
    const actor = scope.actor ?? scope.execution?.actor ?? this.actor;
    if (!actor) {
      return;
    }
    await Promise.all(
      selected.map(tradecraft =>
        actor.system.rollTradecraft(tradecraft, {
          bonus: this.bonus,
          competence: this.overrideCompetence ? this.competence.raw : this.document.system.competence.raw,
          threshold: this.threshold,
        }),
      ),
    );
  }
}
