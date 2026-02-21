import { BaseRoll } from "../../dice/rolls/_module.mjs";
import { makeIconClass } from "../../helpers/utils.mjs";
import { TeriockDialog } from "../api/_module.mjs";

const { fields } = foundry.data;

/**
 * Dialog that allows for modifying a roll with boosts/deboosts.
 * @param {string} rollFormula
 * @param {object} [options]
 * @param {boolean} [options.crit] - Go critical?
 * @param {string} [options.label] - Custom button label
 * @returns {Promise<string>} The roll formula with boost changes applied.
 */
export default async function boostDialog(rollFormula, options = {}) {
  const {
    crit = false,
    label = game.i18n.localize("TERIOCK.DIALOGS.Boost.BUTTONS.ok"),
  } = options;
  let formula = rollFormula;
  const formulaField = new fields.StringField({
    initial: rollFormula,
    label: game.i18n.localize("TERIOCK.DIALOGS.Boost.FIELDS.formula.label"),
    hint: game.i18n.localize("TERIOCK.DIALOGS.Boost.FIELDS.formula.hint"),
  });
  const boostsField = new fields.NumberField({
    min: 0,
    initial: 0,
    label: game.i18n.localize("TERIOCK.DIALOGS.Boost.FIELDS.boosts.label"),
    hint: game.i18n.localize("TERIOCK.DIALOGS.Boost.FIELDS.boosts.hint"),
  });
  const deboostsField = new fields.NumberField({
    min: 0,
    initial: 0,
    label: game.i18n.localize("TERIOCK.DIALOGS.Boost.FIELDS.deboosts.label"),
    hint: game.i18n.localize("TERIOCK.DIALOGS.Boost.FIELDS.deboosts.hint"),
  });
  const critField = new fields.BooleanField({
    label: game.i18n.localize("TERIOCK.DIALOGS.Boost.FIELDS.crit.label"),
    initial: crit,
    hint: game.i18n.localize("TERIOCK.DIALOGS.Boost.FIELDS.crit.hint"),
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
  try {
    await TeriockDialog.prompt({
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
          const roll = new BaseRoll(updatedFormula, {});
          if (crit) {
            roll.alter(2, 0, { multiplyNumeric: false });
          }
          formula = roll.formula;
          const setboostNumber = (boosts - deboosts) * (crit ? 2 : 1);
          if (setboostNumber !== 0) {
            formula = `sb(${formula}, ${setboostNumber})`;
          }
        },
        icon: makeIconClass("dice", "title"),
        label: label,
      },
      window: {
        icon: makeIconClass("dice", "title"),
        title: game.i18n.localize("TERIOCK.DIALOGS.Boost.title"),
      },
    });
  } catch {
    return rollFormula;
  }
  return formula;
}
