import { TeriockExecutionEditor } from "../../../applications/api/_module.mjs";
import { icons } from "../../../constants/display/icons.mjs";
import { FormulaField } from "../../../data/fields/_module.mjs";
import { CompetenceModel } from "../../../data/models/_module.mjs";
import { ThresholdRoll } from "../../../dice/rolls/_module.mjs";
import { addFormula, formulaExists } from "../../../helpers/formula.mjs";

const { fields } = foundry.data;

/**
 * Mixin for executions involving a d20 roll.
 * @param {typeof BaseExecution} Base
 */
export default function ThresholdExecutionMixin(Base) {
  return (
    /**
     * @extends {BaseExecution}
     * @mixin
     */
    class ThresholdExecution extends Base {
      /**
       * @param {Teriock.Execution.ThresholdExecutionOptions} options
       */
      constructor(options = {}) {
        super(options);
        const {
          bonus = "",
          comparison = "gte",
          edge = 0,
          formula = undefined,
          showDialog = game.teriock.getSetting("showRollDialogs"),
          threshold,
        } = options;
        this.edge = edge;
        this.threshold = threshold;
        this.formula = formula;
        this.bonus = `${bonus}`;
        this.comparison = comparison;
        this.showDialog = showDialog;
      }

      /** @returns {Teriock.Execution.ExecutionDialogEntry[]} */
      get _activeDialogFields() {
        return this._dialogFields.filter(f => {
          return typeof f.condition === "function" ? f.condition() : Boolean(f.condition);
        });
      }

      /** @returns {Teriock.Execution.ExecutionDialogButton[]} */
      get _dialogButtons() {
        return this.isRoll
          ? [{
            action: "confirm",
            default: this.edge < 0,
            icon: "fa-dice-d20",
            label: "TERIOCK.DIALOGS.ThresholdExecutionOptions.BUTTONS.disadvantage",
            name: "disadvantage",
            callback: () => (this.edge = -1),
          }, {
            action: "confirm",
            default: this.edge === 0,
            icon: "fa-dice-d20",
            label: "TERIOCK.DIALOGS.ThresholdExecutionOptions.BUTTONS.normal",
            name: "normal",
            callback: () => (this.edge = 0),
          }, {
            action: "confirm",
            default: this.edge > 0,
            icon: "fa-dice-d20",
            label: "TERIOCK.DIALOGS.ThresholdExecutionOptions.BUTTONS.advantage",
            name: "advantage",
            callback: () => (this.edge = 1),
          }]
          : [{ action: "confirm", default: true, icon: icons.ui.enable, label: "COMMON.Confirm", name: "ok" }];
      }

      /** @returns {Teriock.Execution.ExecutionDialogDocument[]} */
      get _dialogDocuments() {
        return [];
      }

      /**  @returns {Teriock.Execution.ExecutionDialogEntry[]} */
      get _dialogFields() {
        return [{
          condition: this.requiresCompetence,
          field: new fields.EmbeddedDataField(CompetenceModel).fields.raw,
          hint: "TERIOCK.DIALOGS.ThresholdExecutionOptions.FIELDS.competence.hint",
          label: "TERIOCK.DIALOGS.ThresholdExecutionOptions.FIELDS.competence.label",
          name: "competence",
          value: this.competence.raw,
          update: v => (this.competence.raw = Number(v)),
        }, {
          condition: this.hasBonus,
          field: new FormulaField({ deterministic: false }),
          hint: "TERIOCK.DIALOGS.ThresholdExecutionOptions.FIELDS.bonus.hint",
          label: "TERIOCK.DIALOGS.ThresholdExecutionOptions.FIELDS.bonus.label",
          name: "bonus",
          placeholder: "0",
          value: this.bonus,
          update: v => (this.bonus = v),
        }];
      }

      /** @inheritDoc */
      get _RollClass() {
        return ThresholdRoll;
      }

      /**
       * Whether this can have a bonus applied.
       * @return {boolean}
       */
      get hasBonus() {
        return this.isRoll;
      }

      /**
       * An icon for this execution to show in dialogs.
       * @returns {string}
       */
      get icon() {
        return "dice-d20";
      }

      /**
       * If this is a roll.
       * @return {boolean}
       */
      get isRoll() {
        return true;
      }

      /**
       * A name for this execution to show in dialogs.
       * @returns {string}
       */
      get name() {
        return "";
      }

      /**
       * Whether this execution requires competence.
       * @return {boolean}
       */
      get requiresCompetence() {
        return this.isRoll;
      }

      /** @inheritDoc */
      get rollOptions() {
        return { comparison: this.comparison, flavor: this.flavor, threshold: this.threshold };
      }

      /** @inheritDoc */
      async _getInput() {
        if (this.showDialog) {
          if ((await this._showRollDialog()) === false) { return false; }
        }
        await super._getInput();
      }

      /** @inheritDoc */
      async _improveFormula() {
        await super._improveFormula();
        if (formulaExists(this.bonus)) { this.formula = addFormula(this.formula, this.bonus); }
      }

      /**
       * Prepare an underlying core formula.
       * @returns {Promise<void>}
       */
      async _prepareBaseFormula() {
        if (!this.formula) {
          let suffix = "";
          if (this.edge > 0) { suffix = "kh1"; }
          if (this.edge < 0) { suffix = "kl1"; }
          this.formula = `${1 + Math.abs(this.edge)}d20${suffix}`;
        }
      }

      /** @inheritDoc */
      async _prepareFormula() {
        await this._prepareBaseFormula();
        await super._prepareFormula();
      }

      /**
       * Show a dialog to configure basic roll options.
       * @returns {Promise<false|void>}
       */
      async _showRollDialog() {
        if (!this._activeDialogFields.length && !this._dialogDocuments.length) { return; }
        const editor = new TeriockExecutionEditor(this);
        const result = await editor.prompt();
        if (result === null) { return false; }
      }
    }
  );
}
