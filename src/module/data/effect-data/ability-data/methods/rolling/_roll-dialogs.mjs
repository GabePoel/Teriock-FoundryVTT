const { api, ux } = foundry.applications;
import { createDialogFieldset } from "../../../../../helpers/html.mjs";

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
    const mpDescription = await ux.TextEditor.enrichHTML(
      abilityData.costs.mp.value.variable,
    );
    const maxMp = actor.system.mp.value - actor.system.mp.min;
    dialogs.push(
      createDialogFieldset("Variable Mana Cost", mpDescription, "mp", maxMp),
    );
  }

  // Variable HP cost dialog
  if (abilityData.costs.hp?.type === "variable") {
    const hpDescription = await ux.TextEditor.enrichHTML(
      abilityData.costs.hp.value.variable,
    );
    const maxHp = actor.system.hp.value - actor.system.hp.min;
    dialogs.push(
      createDialogFieldset(
        "Variable Hit Point Cost",
        hpDescription,
        "hp",
        maxHp,
      ),
    );
  }

  // Variable GP cost dialog
  if (abilityData.costs.gp?.type === "variable") {
    const gpDescription = await ux.TextEditor.enrichHTML(
      abilityData.costs.gp.value.variable,
    );
    dialogs.push(
      createDialogFieldset("Variable Gold Cost", gpDescription, "gp", Infinity),
    );
  }

  // Heightened dialog
  if (
    abilityData.parent.isProficient &&
    abilityData.heightened &&
    !rollConfig.useData.modifiers.noHeighten
  ) {
    const p = actor.system.p;
    const heightenedDescription = await ux.TextEditor.enrichHTML(
      abilityData.heightened,
    );
    dialogs.push(
      createDialogFieldset(
        "Heightened Amount",
        heightenedDescription,
        "heightened",
        p,
      ),
    );
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
        callback: (_event, button) => {
          if (abilityData.costs.mp?.type === "variable") {
            useData.costs.mp = Number(
              button.form.elements.namedItem("mp").value,
            );
          }
          if (abilityData.costs.hp?.type === "variable") {
            useData.costs.hp = Number(
              button.form.elements.namedItem("hp").value,
            );
          }
          if (abilityData.costs.gp?.type === "variable") {
            useData.costs.gp = Number(
              button.form.elements.namedItem("gp").value,
            );
          }
          if (abilityData.parent.isProficient && abilityData.heightened) {
            useData.modifiers.heightened = Number(
              button.form.elements.namedItem("heightened").value,
            );
            useData.costs.mp += useData.modifiers.heightened;
          }
        },
      },
    });
  }
}
