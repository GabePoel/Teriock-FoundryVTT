import {
  selectTradecraftDialog,
  selectTradecraftsDialog,
} from "../../../applications/dialogs/_module.mjs";
import { triggers } from "../../../constants/system/_module.mjs";
import { mix } from "../../../helpers/construction.mjs";
import { TradecraftActivation } from "../activations/command-activations.mjs";
import { ThresholdAutomation } from "./abstract/_module.mjs";
import {
  CompetenceAutomationMixin,
  SelectAutomationMixin,
  TriggerAutomationMixin,
} from "./mixins/_module.mjs";

const { fields } = foundry.data;

/**
 * @extends {ThresholdAutomation}
 * @mixes SelectAutomation
 * @mixes TriggerAutomation
 * @mixes CompetenceAutomation
 */
export default class TradecraftAutomation extends mix(
  ThresholdAutomation,
  SelectAutomationMixin,
  TriggerAutomationMixin,
  CompetenceAutomationMixin,
) {
  /** @inheritDoc */
  static get LABEL() {
    return "TERIOCK.ROLLS.Tradecraft.label";
  }

  /** @inheritDoc */
  static get TYPE() {
    return "tradecraft";
  }

  /** @inheritDoc */
  static get _conditions() {
    return false;
  }

  /** @inheritDoc */
  static get _triggerChoices() {
    return {
      execution: triggers.execution,
    };
  }

  /** @inheritDoc */
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      tradecrafts: new fields.SetField(
        new fields.StringField({
          choices: TERIOCK.reference.tradecrafts,
          label: "TERIOCK.TERMS.Common.tradecraft",
        }),
      ),
    });
  }

  /** @inheritDoc */
  static migrateData(data) {
    if (data.tradecraft && !data.tradecrafts) {
      data.tradecrafts = [data.tradecraft];
      foundry.utils.deleteProperty(data, "tradecraft");
    }
    return super.migrateData(data);
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
      .filter((_) => _)
      .map(
        (tradecraft) =>
          new TradecraftActivation({
            options: {
              tradecraft,
              bonus: this.bonus,
              threshold: this.threshold,
              competence: this.overrideCompetence
                ? this.competence.raw
                : this.document.system.competence.raw,
            },
          }),
      );
  }

  /** @inheritDoc */
  async _preFire(scope) {
    if (scope.awaitFire) await this.executeTradecraft(scope);
    else this.executeTradecraft(scope);
  }

  /**
   * Execute one selected tradecraft.
   * @param {Teriock.System.TriggerScope} scope
   * @returns {Promise<void>}
   */
  async executeTradecraft(scope = {}) {
    if (this.tradecrafts.size === 0) return;
    const choices = Array.from(this.tradecrafts);
    let selected = [];
    if (this.automatic && choices.length === 1) {
      selected = choices;
    } else {
      if (this.multi) {
        selected = await selectTradecraftsDialog(choices);
        if (selected.length === 0) return;
      } else {
        const chosen = await selectTradecraftDialog(choices);
        if (!chosen) return;
        selected = [chosen];
      }
    }
    const actor =
      scope.actor ??
      scope.execution?.actor ??
      this.actor ??
      this.document?.actor;
    if (!actor) return;
    await Promise.all(
      selected.map((tradecraft) =>
        actor.system.rollTradecraft(tradecraft, {
          bonus: this.bonus,
          threshold: this.threshold,
          competence: this.overrideCompetence
            ? this.competence.raw
            : this.document.system.competence.raw,
        }),
      ),
    );
  }
}
