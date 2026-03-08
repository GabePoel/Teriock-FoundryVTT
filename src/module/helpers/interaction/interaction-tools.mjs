import { makeIconClass } from "../utils.mjs";
import BaseButtonHandler from "./button-handlers/base-button-handler.mjs";

/**
 * Parse arguments from a string for an interaction.
 * @param {string} input
 * @returns {(string|number|boolean)[]}
 */
export function parseArguments(input) {
  const regex = /([^\s"']+)|"([^"]*)"|'([^']*)'/g;
  const args = [];
  let match;
  while ((match = regex.exec(input)) !== null) {
    args.push(match[1] || match[2] || match[3]);
  }
  return args.reduce((acc, term) => {
    if (term.includes("=")) {
      const [key, ...valParts] = term.split("=");
      acc.push([key, valParts.join("=")]);
    } else {
      acc.push([term, true]);
    }
    return acc;
  }, []);
}

/**
 * Reformat arguments from interaction entries into an object.
 * @param {[string, any][]} argArr
 * @param {Teriock.Interaction.CommandEntry} command
 * @returns {Record<string, any>}
 */
export function interpretArguments(argArr, command) {
  const argObj = {};
  let num = 0;
  const definedArgs = command.args || [];
  const definedFlags = command.flags || {};
  for (const [key, value] of argArr) {
    if (num < definedArgs.length && typeof value === "boolean") {
      argObj[definedArgs[num]] = key;
      num += 1;
    } else {
      if (definedFlags[key]) argObj[definedFlags[key]] = value;
      else argObj[key] = value;
    }
  }
  return argObj;
}

/**
 * Get a value from a specified property of an interaction.
 * @param {Teriock.Interaction.CommandEntry} interaction
 * @param {string} property
 * @param {object} options
 * @returns {string}
 */
export function getInteractionEntryValue(interaction, property, options) {
  if (!interaction[property]) return "";
  if (typeof interaction[property] === "string") return interaction[property];
  else return interaction[property](options);
}

/**
 * Build a button handler from a command entry.
 * @param {Teriock.Interaction.CommandEntry} command
 * @returns {typeof BaseButtonHandler}
 */
export function CommandButtonHandlerBuilder(command) {
  return (
    /**
     * @mixin
     */
    class CommandButtonHandler extends BaseButtonHandler {
      static ACTION = command.id;

      /** @inheritDoc */
      static buildButton(options = {}) {
        const button = super.buildButton();
        Object.assign(button.dataset, options);
        button.icon = makeIconClass(
          getInteractionEntryValue(command, "icon", options),
          "button",
        );
        button.label = game.i18n.localize(
          getInteractionEntryValue(command, "label", options),
        );
        return button;
      }

      /** @inheritDoc */
      async primaryAction() {
        for (const actor of this.actors) {
          await command.primary(
            actor,
            Object.assign({ event: this.event }, this.options),
          );
        }
      }

      /** @inheritDoc */
      async secondaryAction() {
        for (const actor of this.actors) {
          await command.secondary(
            actor,
            Object.assign({ event: this.event }, this.options),
          );
        }
      }
    }
  );
}
