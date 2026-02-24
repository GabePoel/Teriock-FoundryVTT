import { BaseRoll } from "../../dice/rolls/_module.mjs";
import { TeriockChatMessage } from "../../documents/_module.mjs";
import { getImage, systemPath } from "../../helpers/path.mjs";
import { makeIconClass } from "../../helpers/utils.mjs";
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
      { rootId: foundry.utils.randomID() },
      {
        name: "pull",
        value: actor.system.deathBag.pull,
      },
    ),
  );
  const stonesHTML = document.createElement("fieldset");
  const stonesLegendHTML = document.createElement("legend");
  stonesLegendHTML.innerText = game.i18n.localize(
    "TERIOCK.DIALOGS.DeathBag.legend",
  );
  stonesHTML.append(stonesLegendHTML);
  for (const color of ["black", "red", "white"]) {
    stonesHTML.append(
      actor.system.schema.fields.deathBag.fields.stones.fields[
        color
      ].toFormGroup(
        { rootId: foundry.utils.randomID() },
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
        icon: makeIconClass(TERIOCK.display.icons.ui.deathBag, "title"),
        title: game.i18n.localize("TERIOCK.DIALOGS.DeathBag.title"),
      },
      content: contentHTML,
      buttons: [
        {
          action: "makePull",
          label: game.i18n.localize(
            "TERIOCK.DIALOGS.DeathBag.BUTTONS.makePull",
          ),
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
    Math.max(await BaseRoll.getValue(pullFormula, rollData), 0),
  );
  const startingStones =
    /** @type {Record<Teriock.Parameters.Actor.DeathBagStoneColor, number>} */
    {};
  const pulledStones =
    /** @type {Record<Teriock.Parameters.Actor.DeathBagStoneColor, number>} */
    {};
  /** @type {Teriock.Parameters.Actor.DeathBagStoneColor[]} */
  const bag = [];
  let totalStonesCount = 0;
  const wrappers = [];
  for (const [color, formula] of Object.entries(stonesFormulas)) {
    startingStones[color] = Math.floor(
      Math.max(await BaseRoll.getValue(formula, rollData), 0),
    );
    totalStonesCount += startingStones[color];
    pulledStones[color] = 0;
    wrappers.push(
      `${startingStones[color]} ${TERIOCK.reference.deathBag[color]}`,
    );
  }
  if (totalStonesCount > 99) {
    ui.notifications.error("TERIOCK.DIALOGS.DeathBag.ERRORS.maxStones", {
      format: {
        count: totalStonesCount,
      },
      localize: true,
    });
  } else {
    for (const color of Object.keys(startingStones)) {
      for (let i = 0; i < startingStones[color]; i++) {
        bag.push(color);
      }
    }
    wrappers.push(
      game.i18n.format("TERIOCK.DIALOGS.DeathBag.PANEL.total", {
        count: bag.length,
      }),
    );
    if (bag.length < toPullCount) {
      ui.notifications.error("TERIOCK.DIALOGS.DeathBag.ERRORS.cannotPull", {
        format: {
          bagCount: bag.length,
          toPullCount,
        },
        localize: true,
      });
    } else {
      let pulledCount = 0;
      while (pulledCount < toPullCount) {
        pulledCount++;
        const roll = new BaseRoll(`1d${bag.length}`, {});
        await roll.evaluate();
        const pulledIndex = roll.total - 1;
        const pulledColor = bag.splice(pulledIndex, 1)[0];
        pulledStones[pulledColor] = pulledStones[pulledColor] + 1;
      }
      const context = {
        pulledCount,
        pulledStones,
      };
      /** @type {Teriock.MessageData.MessagePanel} */
      const panelParts = {
        bars: [
          {
            icon: TERIOCK.display.icons.ui.stone,
            label: game.i18n.localize(
              "TERIOCK.DIALOGS.DeathBag.PANEL.initialStonesInBag",
            ),
            wrappers: wrappers,
          },
        ],
        blocks: [
          {
            italic: true,
            text: game.i18n.localize(
              "TERIOCK.DIALOGS.DeathBag.PANEL.descriptionText",
            ),
            title: game.i18n.localize(
              "TERIOCK.DIALOGS.DeathBag.PANEL.description",
            ),
          },
        ],
        icon: TERIOCK.display.icons.ui.deathBag,
        image: getImage("misc", "Death Bag"),
        name: game.i18n.localize("TERIOCK.DIALOGS.DeathBag.PANEL.name"),
      };
      let outcome = "";
      switch (pulledStones.black ?? 0) {
        case 1:
          outcome = game.i18n.localize(
            "TERIOCK.DIALOGS.DeathBag.PANEL.outcome1",
          );
          break;
        case 2:
          outcome = game.i18n.localize(
            "TERIOCK.DIALOGS.DeathBag.PANEL.outcome2",
          );
          break;
        case 3:
          outcome = game.i18n.localize(
            "TERIOCK.DIALOGS.DeathBag.PANEL.outcome3",
          );
          break;
      }
      panelParts.blocks.push({
        title: game.i18n.localize("TERIOCK.DIALOGS.DeathBag.PANEL.outcome"),
        text: outcome,
      });
      const pullContent = await TeriockTextEditor.renderTemplate(
        systemPath("templates/ui-templates/death-bag.hbs"),
        context,
      );
      const panel = await TeriockTextEditor.enrichPanel(panelParts);
      const chatMessageData = {
        speaker: TeriockChatMessage.getSpeaker({ actor: actor }),
        content: pullContent,
        system: {
          panels: [panel],
          tags: [
            game.i18n.format("TERIOCK.DIALOGS.DeathBag.PANEL.pulledStonesTag", {
              count: toPullCount,
            }),
          ],
        },
      };
      await TeriockChatMessage.create(chatMessageData);
    }
  }
}
