import { TeriockTextEditor } from "../_module.mjs";
import { buildCommandOptions, commands, getCommandEntryValue } from "../../../helpers/interaction/_module.mjs";
import { makeIconClass, objectMap } from "../../../helpers/utils.mjs";
import { interpretTerm } from "../enrichment-helpers.mjs";

/**
 * Execute some command.
 * @param {HTMLElement} target
 * @param {"primary" | "secondary"} operation
 * @param {PointerEvent} event
 * @returns {Promise<void>}
 */
async function executeCommand(target, operation, event) {
  event.preventDefault();
  event.stopPropagation();
  const command = commands[target.dataset.command];
  if (!command || !command[operation]) { return; }
  const options = {};
  for (const mod of ["alt", "ctrl", "shift"]) {
    if (command[mod] && event[`${mod}Key`]) { options[command[mod]] = true; }
  }
  for (const [key, value] of Object.entries(target.dataset)) {
    if (!["action", "command"].includes(key)) {
      options[key] = interpretTerm(value);
      if (value === "true") { options[key] = true; }
    }
  }
  let actor;
  if (target.dataset.relativeTo) {
    const doc = await fromUuid(target.dataset.relativeTo);
    actor = doc?.actor;
  }
  if (!actor) { actor = game.actors.default; }
  await command[operation](actor, options);
}

/** @type {Teriock.Enrichment.EnricherConfig} */
const commandEnricher = {
  format: { aliases: Object.keys(commands), hasConfig: true, hasMultipleArguments: false, type: "roll" },
  id: "executeCommand",
  onRender: el => {
    if (el.dataset.enriched) { return; }
    el.dataset.enriched = "true";
    const target = el.firstElementChild;
    el.addEventListener("click", async ev => {
      await executeCommand(target, "primary", ev);
    });
    el.addEventListener("contextmenu", async ev => {
      await executeCommand(target, "secondary", ev);
    });
  },
  process: async (parsed, options) => {
    const command = commands[parsed.alias];
    const payload = parsed.arguments.length ? parsed.arguments[0] : "";
    const commandOptions = { ...parsed.config, ...buildCommandOptions(payload, command) };
    return TeriockTextEditor.createAnchor({
      classes: ["teriock-inline-command"],
      dataset: {
        action: "executeCommand",
        command: command.id,
        relativeTo: options?.relativeTo?.uuid,
        tooltip: getCommandEntryValue(command, "tooltip", commandOptions),
        ...objectMap(commandOptions, v => v.toString()),
      },
      icon: makeIconClass(getCommandEntryValue(command, "icon", commandOptions), "inline"),
      name: parsed.label ?? _loc(getCommandEntryValue(command, "label", commandOptions)),
    });
  },
};

export default commandEnricher;
