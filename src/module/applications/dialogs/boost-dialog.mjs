import impactConfig from "../../constants/config/impact-config.mjs";
import { FormulaField } from "../../data/fields/_module.mjs";
import { BaseRoll } from "../../dice/rolls/_module.mjs";
import { createElement } from "../../helpers/html.mjs";
import { makeIconClass } from "../../helpers/utils.mjs";
import { TeriockDialog } from "../api/_module.mjs";
import { TeriockTextEditor } from "../ux/_module.mjs";

const { fields } = foundry.data;

/**
 * Dialog that allows for modifying a roll with boosts/deboosts.
 * @param {Teriock.System.FormulaString} rollFormula
 * @param {object} [options]
 * @param {Teriock.Keys.Impact} [options.impact] - The type of impact of the roll
 * @param {boolean} [options.crit] - Go critical?
 * @param {number} [options.boosts] - The number of boosts to apply
 * @param {object} [options.rollData] - Roll data to use when updating the formula
 * @param {string} [options.label] - Custom button label
 * @param {AnyChildDocument} [options.document] - Optional document
 * @returns {Promise<Teriock.System.FormulaString|null>} The roll formula with boost changes applied.
 */
export default async function boostDialog(rollFormula, options = {}) {
  const { crit = false, impact, label = _loc("TERIOCK.DIALOGS.Boost.BUTTONS.ok") } = options;
  let formula = rollFormula;
  const contentHtml = document.createElement("div");
  if (options.document) {
    const documentElement = createElement("div");
    documentElement.innerHTML = await TeriockTextEditor.enrichHTML(
      `<p>@EMBED[${options.document.uuid} cite=false caption=false text="" icons=""]</p>`,
    );
    contentHtml.append(documentElement);
  }
  const rootId = foundry.utils.randomID();
  contentHtml.append(
    new FormulaField({
      deterministic: false,
      hint: _loc("TERIOCK.DIALOGS.Boost.FIELDS.formula.hint"),
      initial: rollFormula,
      label: _loc("TERIOCK.DIALOGS.Boost.FIELDS.formula.label"),
      placeholder: "0",
    }).toFormGroup({ rootId }, { name: "formula" }),
    new fields.NumberField({
      hint: _loc("TERIOCK.DIALOGS.Boost.FIELDS.boosts.hint"),
      initial: (options.boosts ?? 0) > 0 ? options.boosts : undefined,
      label: _loc("TERIOCK.DIALOGS.Boost.FIELDS.boosts.label"),
      min: 0,
      placeholder: "0",
    }).toFormGroup({ rootId }, { name: "boosts" }),
    new fields.NumberField({
      hint: _loc("TERIOCK.DIALOGS.Boost.FIELDS.deboosts.hint"),
      initial: (options.boosts ?? 0) < 0 ? -options.boosts : undefined,
      label: _loc("TERIOCK.DIALOGS.Boost.FIELDS.deboosts.label"),
      min: 0,
      placeholder: "0",
    }).toFormGroup({ rootId }, { name: "deboosts" }),
    new fields.BooleanField({
      hint: _loc("TERIOCK.DIALOGS.Boost.FIELDS.crit.hint"),
      initial: crit,
      label: _loc("TERIOCK.DIALOGS.Boost.FIELDS.crit.label"),
      placeholder: "0",
    }).toFormGroup({ rootId }, { name: "crit" }),
  );
  return TeriockDialog.prompt({
    content: contentHtml,
    ok: {
      icon: makeIconClass(TERIOCK.display.icons.ui.dice, "title"),
      label,
      callback: (_event, button) => {
        const updatedFormula = button.form.elements.namedItem("formula").value ?? "0";
        const boosts = Number(button.form.elements.namedItem("boosts").value || "0") || 0;
        const deboosts = Number(button.form.elements.namedItem("deboosts").value || "0") || 0;
        const critButton = /** @type {HTMLInputElement} */ button.form.elements.namedItem("crit");
        const crit = critButton.checked;
        const roll = new BaseRoll(updatedFormula, options.rollData || {});
        if (crit) { roll.alter(2, 0, { multiplyNumeric: false }); }
        formula = roll.formula;
        const setboostNumber = (boosts - deboosts) * (crit ? 2 : 1);
        if (setboostNumber !== 0) { formula = `sb(${formula}, ${setboostNumber})`; }
        return formula;
      },
    },
    position: { width: 550 },
    window: {
      icon: makeIconClass(TERIOCK.display.icons.ui.dice, "title"),
      title: impact
        ? _loc("TERIOCK.DIALOGS.Boost.typeTitle", { type: impactConfig[impact]?.label })
        : _loc("TERIOCK.DIALOGS.Boost.title"),
    },
  });
}
