import { TeriockRoll } from "../../dice/_module.mjs";
import { TeriockChatMessage } from "../../documents/_module.mjs";
import {
  getIcon,
  systemPath
} from "../../helpers/path.mjs";
import { evaluateAsync } from "../../helpers/utils.mjs";
import { TeriockDialog } from "../api/_module.mjs";
import { TeriockTextEditor } from "../ux/_module.mjs";

/**
 * Dialog that asks the {@link TeriockUser} to pull from the Death Bag.
 * @param {TeriockActor} actor
 * @returns {Promise<void>}
 */
export default async function deathBagDialog(actor) {
  const contentHTML = document.createElement("div");
  contentHTML.append(
    actor.system.schema.fields.deathBag.fields.pull.toFormGroup(
      {},
      {
        name: "pull",
        value: actor.system.deathBag.pull,
      },
    ),
  );
  const stonesHTML = document.createElement("fieldset");
  const stonesLegendHTML = document.createElement("legend");
  stonesLegendHTML.innerText = "Stones";
  stonesHTML.append(stonesLegendHTML);
  for (const color of ["black", "red", "white"]) {
    stonesHTML.append(
      actor.system.schema.fields.deathBag.fields.stones.fields[
        color
      ].toFormGroup(
        {},
        {
          name: color,
          value: actor.system.deathBag.stones[color],
        },
      ),
    );
  }
  contentHTML.append(stonesHTML);
  try {
    await new TeriockDialog({
      window: {
        icon: "fa-solid fa-sack",
        title: "Death Bag",
      },
      content: contentHTML,
      buttons: [
        {
          action: "makePull",
          label: "Make Pull",
          default: true,
          callback: async (_event, button) => {
            const stonesFormulas = {};
            for (const color of ["black", "red", "white"]) {
              stonesFormulas[color] =
                button.form.elements.namedItem(color).value;
            }
            await deathBagPull(
              button.form.elements.namedItem("pull").value,
              stonesFormulas,
              actor,
            );
          },
        },
      ],
    }).render(true);
  } catch {}
}

/**
 * Pull from the Death Bag.
 * @param {string} pullFormula
 * @param {Record<Teriock.Parameters.Actor.DeathBagStoneColor, string>} stonesFormulas
 * @param {TeriockActor} [actor]
 */
async function deathBagPull(pullFormula, stonesFormulas, actor) {
  let rollData = {};
  if (actor) {
    rollData = actor.getRollData();
  }
  const toPullCount = Math.floor(
    Math.max(await evaluateAsync(pullFormula, rollData), 0),
  );
  /** @type {Record<Teriock.Parameters.Actor.DeathBagStoneColor, number>} */
  const startingStones = {};
  /** @type {Record<Teriock.Parameters.Actor.DeathBagStoneColor, number>} */
  const pulledStones = {};
  /** @type {Teriock.Parameters.Actor.DeathBagStoneColor[]} */
  const bag = [];
  let totalStonesCount = 0;
  const wrappers = [];
  for (const [color, formula] of Object.entries(stonesFormulas)) {
    startingStones[color] = Math.floor(
      Math.max(await evaluateAsync(formula, rollData), 0),
    );
    totalStonesCount += startingStones[color];
    pulledStones[color] = 0;
    wrappers.push(`${startingStones[color]} ${TERIOCK.index.deathBag[color]}`);
  }
  if (totalStonesCount > 99) {
    foundry.ui.notifications.error(
      `Bag has ${totalStonesCount} stones. Maximum of 99 allowed.`,
    );
  } else {
    for (const color of Object.keys(startingStones)) {
      for (let i = 0; i < startingStones[color]; i++) {
        bag.push(color);
      }
    }
    wrappers.push(`${bag.length} total`);
    if (bag.length < toPullCount) {
      foundry.ui.notifications.error(
        `Bag has ${bag.length} stones. Cannot pull ${toPullCount} stones from it.`,
      );
    } else {
      let pulledCount = 0;
      while (pulledCount < toPullCount) {
        pulledCount++;
        const roll = new TeriockRoll(`1d${bag.length}`, {});
        await roll.evaluate();
        const pulledIndex = roll.total - 1;
        const pulledColor = bag.splice(pulledIndex, 1)[0];
        pulledStones[pulledColor] = pulledStones[pulledColor] + 1;
      }
      const context = {
        TERIOCK: TERIOCK,
        pulledCount,
        pulledStones,
      };
      /** @type {Teriock.MessageData.MessagePanel} */
      const messageParts = {
        image: getIcon("conditions", "Dead"),
        name: "Death Bag",
        bars: [
          {
            label: "Initial Stones in Bag",
            icon: "fa-sack",
            wrappers: wrappers,
          },
        ],
        blocks: [
          {
            title: "Description",
            text:
              "You are surrounded by darkness, but aren't alone. Something is reaching out to you. Something?" +
              " Several things? It's not clear. You reach back, grasp something, and start to pull. It pulls you as" +
              " well.",
            italic: true,
          },
        ],
        icon: "sack",
        label: "Death Bag",
      };
      const pullContent = await foundry.applications.handlebars.renderTemplate(
        systemPath("templates/message-templates/death-bag.hbs"),
        context,
      );
      const panel = await TeriockTextEditor.enrichPanel(messageParts);
      const chatMessageData = {
        speaker: TeriockChatMessage.getSpeaker({ actor: actor }),
        content: pullContent,
        system: {
          panels: [panel],
          tags: [`Pulled ${toPullCount} Stones`],
        },
      };
      await TeriockChatMessage.create(chatMessageData);
    }
  }
}
