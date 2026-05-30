import { ucFirst } from "../../helpers/string.mjs";
import { makeIconClass } from "../../helpers/utils.mjs";
import { TeriockDialog } from "../api/_module.mjs";

/**
 * Dialog that sets {@link StatDieModel} values.
 * @param {BaseStatPoolModel} pool
 */
export default async function setStatDiceDialog(pool) {
  const formulaForm = pool.schema.fields.formula.toFormGroup({
    hint: _loc("TERIOCK.MODELS.BaseStatPool.FIELDS.formula.hint"),
    label: _loc("TERIOCK.MODELS.BaseStatPool.FIELDS.formula.label"),
    rootId: foundry.utils.randomID(),
  }, { name: "formula", value: pool._source.formula });
  const canToggle = pool.parent[`_canToggle${ucFirst(pool.stat)}Dice`];
  const tooltip = !canToggle ? _loc("TERIOCK.SYSTEMS.StatGiver.DIALOG.cantToggle") : "";
  const dataset = {};
  if (tooltip.length > 0) { dataset.tooltip = tooltip; }
  const disabledForm = pool.schema.fields.disabled.toFormGroup({ rootId: foundry.utils.randomID() }, {
    dataset,
    disabled: !canToggle,
    name: "disabled",
    value: pool.disabled,
  });
  const contentElement = document.createElement("div");
  contentElement.append(...[formulaForm, disabledForm]);
  await TeriockDialog.prompt({
    content: contentElement,
    modal: true,
    ok: {
      icon: makeIconClass(TERIOCK.display.icons.ui.enable, "button"),
      label: _loc("COMMON.Confirm"),
      callback: async (_event, button) => {
        const formulaInput = /** @type {HTMLInputElement} */ button.form.elements.namedItem("formula");
        const disabledInput = /** @type {HTMLInputElement} */ button.form.elements.namedItem("disabled");
        const formula = formulaInput.value;
        const disabled = disabledInput.checked;
        if (formula !== pool.formula || disabled !== pool.disabled) { await pool.update({ disabled, formula }); }
      },
    },
    window: {
      icon: makeIconClass(TERIOCK.display.icons.ui.dice, "title"),
      title: _loc("TERIOCK.DIALOGS.SetStatDice.title", { dieName: pool.dieName }),
    },
  });
}
