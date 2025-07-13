const { api, ux } = foundry.applications;

/**
 * Handles dialogs for variable costs and heightened effects.
 * Prompts user for variable MP/HP costs and heightened amounts.
 *
 * @param {object} rollConfig
 * @returns {Promise<void>} Promise that resolves when dialogs are handled.
 * @private
 */
export async function _handleDialogs(rollConfig) {
  const abilityData = rollConfig.abilityData;
  const useData = rollConfig.useData;
  const dialogs = [];
  const actor = abilityData.actor;

  // Variable MP cost dialog
  if (abilityData.costs.mp?.type === "variable") {
    const mpDescription = await ux.TextEditor.enrichHTML(abilityData.costs.mp.value.variable);
    const maxMp = actor.system.mp.value - actor.system.mp.min;
    dialogs.push(createDialogFieldset("Variable Mana Cost", mpDescription, "mp", maxMp));
  }

  // Variable HP cost dialog
  if (abilityData.costs.hp?.type === "variable") {
    const hpDescription = await ux.TextEditor.enrichHTML(abilityData.costs.hp.value.variable);
    const maxHp = actor.system.hp.value - actor.system.hp.min;
    dialogs.push(createDialogFieldset("Variable Hit Point Cost", hpDescription, "hp", maxHp));
  }

  // Heightened dialog
  if (abilityData.parent.isProficient && abilityData.heightened) {
    const p = actor.system.p;
    const heightenedDescription = await ux.TextEditor.enrichHTML(abilityData.heightened);
    dialogs.push(createDialogFieldset("Heightened Amount", heightenedDescription, "heightened", p));
  }

  if (dialogs.length > 0) {
    const action = abilityData.spell ? "Casting" : "Executing";
    const title = `${action} ${abilityData.parent.name}`;
    await api.DialogV2.prompt({
      window: { title },
      content: dialogs.join(""),
      modal: true,
      ok: {
        label: "Confirm",
        callback: (event, button) => {
          if (abilityData.costs.mp?.type === "variable") {
            useData.costs.mp = Number(button.form.elements.namedItem("mp").value);
          }
          if (abilityData.costs.hp?.type === "variable") {
            useData.costs.hp = Number(button.form.elements.namedItem("hp").value);
          }
          if (abilityData.parent.isProficient && abilityData.heightened) {
            useData.modifiers.heightened = Number(button.form.elements.namedItem("heightened").value);
            useData.costs.mp += useData.modifiers.heightened;
          }
        },
      },
    });
  }
}

/**
 * Creates a dialog fieldset for user input.
 *
 * @param {string} legend - The legend text for the fieldset.
 * @param {string} description - The description text for the field.
 * @param {string} name - The name attribute for the input field.
 * @param {number} max - The maximum value for the number input.
 * @returns {string} HTML string for the dialog fieldset.
 * @private
 */
function createDialogFieldset(legend, description, name, max) {
  return `
    <fieldset><legend>${legend}</legend>
      <div>${description}</div>
      <input type="number" name="${name}" value="0" min="0" max="${max}" step="1">
    </fieldset>`;
}
