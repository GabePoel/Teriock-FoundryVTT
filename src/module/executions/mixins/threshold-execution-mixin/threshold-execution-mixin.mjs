import { TeriockDialog } from "../../../applications/api/_module.mjs";
import { icons } from "../../../constants/display/icons.mjs";
import { FormulaField } from "../../../data/fields/_module.mjs";
import { CompetenceModel } from "../../../data/models/_module.mjs";
import { ThresholdRoll } from "../../../dice/rolls/_module.mjs";
import { addFormula, formulaExists } from "../../../helpers/formula.mjs";
import { makeIconClass } from "../../../helpers/utils.mjs";

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
          threshold,
          formula = undefined,
          edge = 0,
          bonus = "",
          comparison = "gte",
          showDialog = game.teriock.getSetting("showRollDialogs"),
        } = options;
        this.edge = edge;
        this.threshold = threshold;
        this.formula = formula;
        this.bonus = `${bonus}`;
        this.comparison = comparison;
        this.showDialog = showDialog;
      }

      /** @inheritDoc */
      get _RollClass() {
        return ThresholdRoll;
      }

      /**
       * @returns {Teriock.Execution.ExecutionDialogButton[]}
       */
      get _dialogButtons() {
        return this.isRoll
          ? [
              {
                action: "disadvantage",
                callback: () => (this.edge = -1),
                icon: "fa-dice-d20",
                label: "TERIOCK.DIALOGS.ThresholdExecutionOptions.BUTTONS.disadvantage",
              },
              {
                action: "normal",
                callback: () => (this.edge = 0),
                default: true,
                icon: "fa-dice-d20",
                label: "TERIOCK.DIALOGS.ThresholdExecutionOptions.BUTTONS.normal",
              },
              {
                action: "advantage",
                callback: () => (this.edge = 1),
                icon: "fa-dice-d20",
                label: "TERIOCK.DIALOGS.ThresholdExecutionOptions.BUTTONS.advantage",
              },
            ]
          : [
              {
                action: "ok",
                default: true,
                icon: icons.ui.enable,
                label: "TERIOCK.DIALOGS.SetStatDice.BUTTONS.confirm",
              },
            ];
      }

      /**
       * @returns {Teriock.Execution.ExecutionDialogEntry[]}
       */
      get _dialogFields() {
        return [
          {
            condition: this.requiresCompetence,
            field: new fields.EmbeddedDataField(CompetenceModel).fields.raw,
            hint: "TERIOCK.DIALOGS.ThresholdExecutionOptions.FIELDS.competence.hint",
            label: "TERIOCK.DIALOGS.ThresholdExecutionOptions.FIELDS.competence.label",
            name: "competence",
            update: v => (this.competence.raw = Number(v)),
            value: this.competence.raw,
          },
          {
            condition: this.hasBonus,
            field: new FormulaField({ deterministic: false }),
            hint: "TERIOCK.DIALOGS.ThresholdExecutionOptions.FIELDS.bonus.hint",
            label: "TERIOCK.DIALOGS.ThresholdExecutionOptions.FIELDS.bonus.label",
            name: "bonus",
            placeholder: "0",
            update: v => (this.bonus = v),
            value: this.bonus,
          },
        ];
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
        return {
          comparison: this.comparison,
          flavor: this.flavor,
          threshold: this.threshold,
        };
      }

      /**
       * Update this given the choices selected in the roll dialog.
       * @param {HTMLButtonElement} button
       */
      #updateFromRollDialog(button) {
        for (const f of this._dialogFields) {
          if (typeof f.condition === "boolean" && !f.condition) {
            continue;
          }
          if (typeof f.condition === "function" && !f.condition()) {
            continue;
          }
          let value;
          const element =
            /** @type {HTMLInputElement} */
            button.form.elements.namedItem(f.name);
          if (f.field instanceof fields.BooleanField) {
            value = element.checked;
          } else if (f.field instanceof fields.NumberField) {
            value = Number(element.value);
          } else {
            value = element.value;
          }
          f.update(value);
        }
      }

      /** @inheritDoc */
      async _getInput() {
        if (this.showDialog) {
          if ((await this._showRollDialog()) === false) {
            return false;
          }
        }
        await super._getInput();
      }

      /** @inheritDoc */
      async _improveFormula() {
        await super._improveFormula();
        if (formulaExists(this.bonus)) {
          this.formula = addFormula(this.formula, this.bonus);
        }
      }

      /**
       * Prepare an underlying core formula.
       * @returns {Promise<void>}
       */
      async _prepareBaseFormula() {
        if (!this.formula) {
          let suffix = "";
          if (this.edge > 0) {
            suffix = "kh1";
          }
          if (this.edge < 0) {
            suffix = "kl1";
          }
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
        const rootId = foundry.utils.randomID();
        const content = document.createElement("div");
        content.classList.add("teriock-form-container");
        let hasFields = false;
        const mainContainer = document.createElement("div");
        mainContainer.classList.add("teriock-form-container");
        const smallContainer = document.createElement("div");
        smallContainer.classList.add("ttable");
        smallContainer.style.rowGap = "0.75rem";
        smallContainer.style.columnGap = "1.5rem";
        let hasSmallFields = false;
        for (const f of this._dialogFields) {
          if (typeof f.condition === "boolean" && !f.condition) {
            continue;
          }
          if (typeof f.condition == "function" && !f.condition()) {
            continue;
          }
          const groupConfig = {
            classes: ["tgrid-item"],
            label: _loc(f.label),
            rootId,
          };
          if (f.hint) {
            groupConfig.hint = _loc(f.hint);
          }
          const inputConfig = {
            id: `${rootId}-${f.name}`,
            integer: f.integer,
            max: f.max,
            min: f.min,
            name: f.name,
            placeholder: f.placeholder,
            rootId,
            value: f.value,
          };
          let container = mainContainer;
          const formGroup = f.field.toFormGroup(groupConfig, inputConfig);
          if (f.small) {
            container = smallContainer;
            hasSmallFields = true;
          }
          container.append(formGroup);
          hasFields = true;
        }
        content.append(mainContainer);
        if (hasSmallFields) {
          content.append(smallContainer);
        }
        if (!hasFields) {
          return;
        }
        const out = await TeriockDialog.wait({
          buttons: this._dialogButtons.map(b => {
            return {
              action: b.action,
              callback: (_event, button) => {
                this.#updateFromRollDialog(button);
                if (typeof b.callback === "function") {
                  b.callback();
                }
              },
              default: b.default,
              icon: makeIconClass(b.icon || this.icon, "button"),
              label: _loc(b.label),
            };
          }),
          content: content.outerHTML,
          modal: true,
          position: { width: 550 },
          window: {
            contentClasses: ["wide-toggles"],
            icon: makeIconClass(this.icon, "title"),
            title: game.i18n
              .format("TERIOCK.DIALOGS.ThresholdExecutionOptions.title", {
                name: this.name,
              })
              .trim(),
          },
        });
        if (out === null) {
          return false;
        }
      }
    }
  );
}
