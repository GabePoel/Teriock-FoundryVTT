import { DeathBag } from "../../dice/_module.mjs";
import { TeriockChatMessage } from "../../documents/_module.mjs";
import { evaluateAsync } from "../../helpers/utils.mjs";
import { TeriockDialog } from "../api/_module.mjs";

/**
 * Dialog that asks the {@link TeriockUser} to pull from the Death Bag.
 * @param {TeriockActor} actor
 * @returns {Promise<void>}
 */
export default async function deathBagDialog(actor) {
  const contentHTML = document.createElement("div");
  contentHTML.append(actor.system.schema.fields.deathBag.fields.pull.toFormGroup({}, {
    name: "pull",
    value: actor.system.deathBag.pull,
  }));
  const stonesHTML = document.createElement("fieldset");
  const stonesLegendHTML = document.createElement("legend");
  stonesLegendHTML.innerText = "Stones";
  stonesHTML.append(stonesLegendHTML);
  for (const color of [
    "black",
    "red",
    "white",
  ]) {
    stonesHTML.append(actor.system.schema.fields.deathBag.fields.stones.fields[color].toFormGroup({}, {
      name: color,
      value: actor.system.deathBag.stones[color],
    }));
  }
  contentHTML.append(stonesHTML);
  try {
    await new TeriockDialog({
      window: { title: "Death Bag" },
      content: contentHTML,
      buttons: [
        {
          action: "makePull",
          label: "Make Pull",
          default: true,
          callback: async (_event, button) => {
            const rollData = actor.getRollData();
            const pullFormula = button.form.elements.namedItem("pull").value;
            const blackFormula = button.form.elements.namedItem("black").value;
            const redFormula = button.form.elements.namedItem("red").value;
            const whiteFormula = button.form.elements.namedItem("white").value;
            const pull = await evaluateAsync(pullFormula, rollData);
            const black = await evaluateAsync(blackFormula, rollData);
            const red = await evaluateAsync(redFormula, rollData);
            const white = await evaluateAsync(whiteFormula, rollData);
            let rollFormula = `pull(${pull}, ${black}[black] + ${red}[red] + ${white}[white])`;
            const deathBag = new DeathBag(rollFormula, actor.getRollData());
            await deathBag.evaluate();
            await deathBag.toMessage({
              speaker: TeriockChatMessage.getSpeaker({ actor: actor }),
              flavor: "Death Bag Pull",
              rollMode: game.settings.get("core", "rollMode"),
            });
          },
        },
      ],
    }).render(true);
  } catch {}
}