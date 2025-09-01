import { TeriockRoll } from "../../documents/_module.mjs";
import { TeriockDialog } from "../api/_module.mjs";

const { fields } = foundry.data;

/**
 * Dialog that allows for modifying a roll with boosts/deboosts.
 * @param {string} rollFormula
 * @param {object} [options]
 * @param {boolean} [options.crit] Go critical?
 * @returns {Promise<string>} The roll formula with boost changes applied.
 */
export default async function boostDialog(
  rollFormula,
  options = { crit: false },
) {
  let formula = rollFormula;
  const formulaField = new fields.StringField({
    initial: rollFormula,
    label: "Roll Formula",
    hint: "The original formula. Make changes as needed, but do not directly apply boosts or deboots.",
  });
  const boostsField = new fields.NumberField({
    min: 0,
    initial: 0,
    label: "Boosts",
    hint: "A number of boosts to apply.",
  });
  const deboostsField = new fields.NumberField({
    min: 0,
    initial: 0,
    label: "Deboosts",
    hint: "A number of deboosts to apply.",
  });
  const critField = new fields.BooleanField({
    label: "Go Critical",
    initial: options.crit,
    hint: "Double the number of dice rolled. This applies after boosts and deboosts.",
  });
  const contentHtml = document.createElement("div");
  contentHtml.append(formulaField.toFormGroup({}, { name: "formula" }));
  contentHtml.append(boostsField.toFormGroup({}, { name: "boosts" }));
  contentHtml.append(deboostsField.toFormGroup({}, { name: "deboosts" }));
  contentHtml.append(critField.toFormGroup({}, { name: "crit" }));
  try {
    await TeriockDialog.prompt({
      window: { title: "Modify Roll Formula" },
      modal: true,
      content: contentHtml,
      ok: {
        label: "Apply",
        callback: (_event, button) => {
          const updatedFormula =
            button.form.elements.namedItem("formula").value;
          const boosts = Number(button.form.elements.namedItem("boosts").value);
          const deboosts = Number(
            button.form.elements.namedItem("deboosts").value,
          );
          const critButton =
            /** @type {HTMLInputElement} */ button.form.elements.namedItem(
              "crit",
            );
          const crit = critButton.checked;
          const roll = new TeriockRoll(updatedFormula, {});
          roll.setBoost(boosts - deboosts);
          if (crit) roll.alter(2, 0, { multiplyNumeric: false });
          formula = roll.formula;
        },
      },
    });
  } catch {
    return rollFormula;
  }
  return formula;
}
