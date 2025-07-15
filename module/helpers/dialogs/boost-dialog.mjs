const { DialogV2 } = foundry.applications.api;
import { TeriockRoll } from "../../documents/_module.mjs";

/**
 * Dialog that allows for modifying a roll with boosts/deboosts.
 *
 * @param {string} rollFormula
 * @returns {Promise<string>} The roll formula with boost changes applied.
 */
export default async function boostDialog(rollFormula) {
  let formula = rollFormula;
  try {
    await DialogV2.prompt({
      window: { title: "Modify Roll Formula" },
      modal: true,
      content: `
        <div class="standard-form form-group">
          <label>Roll Formula</label>
          <div class="form-fields">
            <input
              type="text"
              name="formula"
              value="${rollFormula}"
            >
          </div>
          <p class="hint">The original formula. Make changes as needed, but do not directly apply boosts or deboots.</p>
        </div>
        <div class="standard-form form-group">
          <label for="modify-roll-boost">Boosts</label>
          <div class="form-fields">
            <input
              type="number"
              name="boosts"
              value="0"
              min="0"
              id="modify-roll-boost"
            >
          </div>
          <p class="hint">A number of boosts to apply.</p>
        </div>
        <div class="standard-form form-group">
          <label for="modify-roll-deboost">Deboosts</label>
          <div class="form-fields">
            <input
              type="number"
              name="deboosts"
              value="0"
              min="0"
              id="modify-roll-deboost"
            >
          </div>
          <p class="hint">A number of deboosts to apply.</p>
        </div>
        <div class="standard-form form-group">
          <label for="modify-roll-crit">Go Critical</label>
          <div class="form-fields">
            <input
              type="checkbox"
              name="crit"
              id="modify-roll-crit"
            >
          </div>
          <p class="hint">Double the number of dice rolled. This applies after boosts and deboosts.</p>
        </div>
      `,
      ok: {
        label: "Apply",
        callback: (event, button) => {
          const updatedFormula = button.form.elements.namedItem("formula").value;
          const boosts = Number(button.form.elements.namedItem("boosts").value);
          const deboosts = Number(button.form.elements.namedItem("deboosts").value);
          const critButton = /** @type {HTMLInputElement} */ button.form.elements.namedItem("crit");
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
