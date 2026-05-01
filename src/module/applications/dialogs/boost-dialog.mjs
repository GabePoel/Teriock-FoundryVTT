import { impactConfig } from "../../constants/config/impact-config.mjs";
import { BaseRoll } from "../../dice/rolls/_module.mjs";
import { makeIconClass } from "../../helpers/utils.mjs";
import { TeriockDialog } from "../api/_module.mjs";

const { fields } = foundry.data;

/**
 * Dialog that allows for modifying a roll with boosts/deboosts.
 * @param {Teriock.System.FormulaString} rollFormula
 * @param {object} [options]
 * @param {boolean} [options.crit] - Go critical?
 * @param {string} [options.label] - Custom button label
 * @param {string} [options.type] - The title of the type of roll being made
 * @param {number} [options.boosts] - The number of boosts to apply
 * @param {object} [options.rollData] - Roll data to use when updating the formula.
 * @returns {Promise<Teriock.System.FormulaString|null>} The roll formula with boost changes applied.
 */
export default async function boostDialog(rollFormula, options = {}) {
  const {
    crit = false,
    label = _loc("TERIOCK.DIALOGS.Boost.BUTTONS.ok"),
    impact,
  } = options;
  let formula = rollFormula;
  const formulaField = new fields.StringField({
    hint: _loc("TERIOCK.DIALOGS.Boost.FIELDS.formula.hint"),
    initial: rollFormula,
    label: _loc("TERIOCK.DIALOGS.Boost.FIELDS.formula.label"),
  });
  const boostsField = new fields.NumberField({
    hint: _loc("TERIOCK.DIALOGS.Boost.FIELDS.boosts.hint"),
    initial: (options.boosts ?? 0) > 0 ? options.boosts : 0,
    label: _loc("TERIOCK.DIALOGS.Boost.FIELDS.boosts.label"),
    min: 0,
  });
  const deboostsField = new fields.NumberField({
    hint: _loc("TERIOCK.DIALOGS.Boost.FIELDS.deboosts.hint"),
    initial: (options.boosts ?? 0) < 0 ? -options.boosts : 0,
    label: _loc("TERIOCK.DIALOGS.Boost.FIELDS.deboosts.label"),
    min: 0,
  });
  const critField = new fields.BooleanField({
    hint: _loc("TERIOCK.DIALOGS.Boost.FIELDS.crit.hint"),
    initial: crit,
    label: _loc("TERIOCK.DIALOGS.Boost.FIELDS.crit.label"),
  });
  const contentHtml = document.createElement("div");
  contentHtml.append(
    formulaField.toFormGroup(
      { rootId: foundry.utils.randomID() },
      { name: "formula" },
    ),
  );
  contentHtml.append(
    boostsField.toFormGroup(
      { rootId: foundry.utils.randomID() },
      { name: "boosts" },
    ),
  );
  contentHtml.append(
    deboostsField.toFormGroup(
      { rootId: foundry.utils.randomID() },
      { name: "deboosts" },
    ),
  );
  contentHtml.append(
    critField.toFormGroup(
      { rootId: foundry.utils.randomID() },
      { name: "crit" },
    ),
  );
  return await TeriockDialog.prompt({
    content: contentHtml,
    modal: true,
    ok: {
      callback: (_event, button) => {
        let updatedFormula = button.form.elements.namedItem("formula").value;
        const boosts = Number(button.form.elements.namedItem("boosts").value);
        const deboosts = Number(
          button.form.elements.namedItem("deboosts").value,
        );
        const critButton =
          /** @type {HTMLInputElement} */ button.form.elements.namedItem(
            "crit",
          );
        const crit = critButton.checked;
        const roll = new BaseRoll(updatedFormula, options.rollData || {});
        if (crit) {
          roll.alter(2, 0, { multiplyNumeric: false });
        }
        formula = roll.formula;
        const setboostNumber = (boosts - deboosts) * (crit ? 2 : 1);
        if (setboostNumber !== 0) {
          formula = `sb(${formula}, ${setboostNumber})`;
        }
        return formula;
      },
      icon: makeIconClass(TERIOCK.display.icons.ui.dice, "title"),
      label: label,
    },
    window: {
      icon: makeIconClass(TERIOCK.display.icons.ui.dice, "title"),
      title: impact
        ? _loc("TERIOCK.DIALOGS.Boost.typeTitle", {
            type: impactConfig[impact]?.label,
          })
        : _loc("TERIOCK.DIALOGS.Boost.title"),
    },
  });
}
