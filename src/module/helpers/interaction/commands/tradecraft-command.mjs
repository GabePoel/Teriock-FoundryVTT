import { tradecraftOptions } from "../../../constants/options/tradecraft-options.mjs";
import { thresholdCommand } from "./abstract-command.mjs";

const allOptions = {};
Object.values(tradecraftOptions).forEach((fieldOption) => {
  Object.assign(allOptions, fieldOption.tradecrafts);
});

/**
 * @param {TeriockActor} actor
 * @param {Teriock.Interaction.TradecraftOptions} options
 */
async function primary(actor, options = {}) {
  options.showDialog = game.settings.get("teriock", "showRollDialogs");
  const tradecraft = options.tradecraft || "artist";
  await actor.system.rollTradecraft(tradecraft, options);
}

/**
 * @param {TeriockActor} actor
 * @param {Teriock.Interaction.TradecraftOptions} options
 */
async function secondary(actor, options = {}) {
  options.showDialog = !game.settings.get("teriock", "showRollDialogs");
  const tradecraft = options.tradecraft || "artist";
  await actor.system.rollTradecraft(tradecraft, options);
}

/**
 * Tradecraft command
 * @type {Teriock.Interaction.CommandEntry}
 */
const command = {
  ...thresholdCommand,
  aliases: ["tc"],
  args: ["tradecraft"],
  icon: (options) => `${allOptions[options?.tradecraft || "artist"].icon}`,
  id: "tradecraft",
  label: (options) =>
    allOptions[options?.tradecraft]?.name
      ? game.i18n.format("TERIOCK.ROLLS.Tradecraft.name", {
          value: allOptions[options?.tradecraft].name,
        })
      : game.i18n.localize("TERIOCK.ROLLS.Tradecraft.label"),
  primary,
  secondary,
};

export default command;
