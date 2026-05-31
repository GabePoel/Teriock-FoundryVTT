import { BaseRoll } from "../../dice/rolls/_module.mjs";
import { TeriockChatMessage } from "../../documents/_module.mjs";
import { createElement } from "../../helpers/html.mjs";
import { getImage } from "../../helpers/path.mjs";
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
    actor.system.schema.fields.deathBag.fields.pull.toFormGroup({ rootId: foundry.utils.randomID() }, {
      name: "pull",
      value: actor.system.deathBag.pull,
    }),
  );
  const stonesHTML = document.createElement("fieldset");
  const stonesLegendHTML = createElement("legend", { innerText: _loc("TERIOCK.DIALOGS.DeathBag.legend") });
  stonesHTML.append(stonesLegendHTML);
  for (const color of ["black", "red", "white"]) {
    stonesHTML.append(
      actor.system.schema.fields.deathBag.fields.stones.fields[color].toFormGroup(
        { rootId: foundry.utils.randomID() },
        { name: color, value: actor.system.deathBag.stones[color] },
      ),
    );
  }
  contentHTML.append(stonesHTML);
  await new TeriockDialog({
    buttons: [{
      action: "makePull",
      default: true,
      label: _loc("TERIOCK.DIALOGS.DeathBag.BUTTONS.makePull"),
      callback: async (_event, button) => {
        const stonesFormulas = {};
        for (const color of ["black", "red", "white"]) {
          stonesFormulas[color] = button.form.elements.namedItem(color).value;
        }
        await deathBagPull(button.form.elements.namedItem("pull").value, stonesFormulas, actor);
      },
    }],
    content: contentHTML,
    window: {
      icon: makeIconClass(TERIOCK.display.icons.ui.deathBag, "title"),
      title: _loc("TERIOCK.DIALOGS.DeathBag.title"),
    },
  }).render(true);
}

/**
 * Pull from the Death Bag.
 * @param {string} pullFormula
 * @param {Record<Teriock.Keys.DeathBagStoneColor, string>} stonesFormulas
 * @param {TeriockActor} [actor]
 */
async function deathBagPull(pullFormula, stonesFormulas, actor) {
  let rollData = {};
  if (actor) { rollData = actor.getRollData(); }
  const toPullCount = Math.floor(Math.max(await BaseRoll.getValue(pullFormula, rollData), 0));
  const startingStones =
    /** @type {Record<Teriock.Keys.DeathBagStoneColor, number>} */
    {};
  const pulledStones =
    /** @type {Record<Teriock.Keys.DeathBagStoneColor, number>} */
    {};
  /** @type {Teriock.Keys.DeathBagStoneColor[]} */
  const bag = [];
  let totalStonesCount = 0;
  const wrappers = [];
  for (const [color, formula] of Object.entries(stonesFormulas)) {
    startingStones[color] = Math.floor(Math.max(await BaseRoll.getValue(formula, rollData), 0));
    totalStonesCount += startingStones[color];
    pulledStones[color] = 0;
    wrappers.push(`${startingStones[color]} ${TERIOCK.reference.deathBag[color]}`);
  }
  if (totalStonesCount > 99) {
    ui.notifications.error("TERIOCK.DIALOGS.DeathBag.ERRORS.maxStones", {
      format: { count: totalStonesCount },
      localize: true,
    });
  } else {
    for (const color of Object.keys(startingStones)) {
      for (let i = 0; i < startingStones[color]; i++) {
        bag.push(color);
      }
    }
    wrappers.push(_loc("TERIOCK.DIALOGS.DeathBag.PANEL.total", { count: bag.length }));
    if (bag.length < toPullCount) {
      ui.notifications.error("TERIOCK.DIALOGS.DeathBag.ERRORS.cannotPull", {
        format: { bagCount: bag.length, toPullCount },
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
      const context = { pulledCount, pulledStones };
      /** @type {Teriock.Panels.PanelParts} */
      const panelParts = {
        bars: [{
          icon: TERIOCK.config.document.stone.icon,
          label: _loc("TERIOCK.DIALOGS.DeathBag.PANEL.initialStonesInBag"),
          wrappers,
        }],
        blocks: [{
          italic: true,
          text: _loc("TERIOCK.DIALOGS.DeathBag.PANEL.descriptionText"),
          title: _loc("TERIOCK.DIALOGS.DeathBag.PANEL.description"),
        }],
        icon: TERIOCK.display.icons.ui.deathBag,
        image: getImage("misc", "Death Bag"),
        name: _loc("TERIOCK.DIALOGS.DeathBag.PANEL.name"),
      };
      let outcome = "";
      switch (pulledStones.black ?? 0) {
        case 1:
          outcome = _loc("TERIOCK.DIALOGS.DeathBag.PANEL.outcome1");
          break;
        case 2:
          outcome = _loc("TERIOCK.DIALOGS.DeathBag.PANEL.outcome2");
          break;
        case 3:
          outcome = _loc("TERIOCK.DIALOGS.DeathBag.PANEL.outcome3");
          break;
        default:
          break;
      }
      panelParts.blocks.push({ text: outcome, title: _loc("TERIOCK.DIALOGS.DeathBag.PANEL.outcome") });
      const pullContent = await TeriockTextEditor.renderTemplate("teriock/ui/death-bag", context);
      const panel = await TeriockTextEditor.enrichPanel(panelParts);
      const chatMessageData = {
        content: pullContent,
        speaker: TeriockChatMessage.getSpeaker({ actor }),
        system: {
          panels: [panel],
          tags: [_loc("TERIOCK.DIALOGS.DeathBag.PANEL.pulledStonesTag", { count: toPullCount })],
        },
      };
      await TeriockChatMessage.create(chatMessageData, { chatBubble: false, defaultMode: true });
    }
  }
}
