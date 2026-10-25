import { TeriockTextEditor } from "../_module.mjs";
import { makeIconClass, objectMap } from "../../../utils/_module.mjs";
import { interpretTerm } from "../enrichment-helpers.mjs";

/**
 * Take or reverse some command.
 * @param {HTMLElement} target
 * @param {"take" | "reverse"} operation
 * @param {PointerEvent} event
 * @returns {Promise<void>}
 */
async function executeCommand(target, operation, event) {
  event.preventDefault();
  event.stopPropagation();
  const key = target.dataset.command;
  if (!TERIOCK.CONFIG.command[key]) { return; }
  const options = { event };
  for (const [k, value] of Object.entries(target.dataset)) {
    if (!["action", "command"].includes(k)) {
      options[k] = interpretTerm(value);
    }
  }
  let actor;
  if (target.dataset.relativeTo) {
    const doc = await fromUuid(target.dataset.relativeTo);
    actor = doc?.actor;
  }
  if (!actor) { actor = game.actors.default; }
  await game.teriock.commands[operation](key, actor ? [actor] : [], options);
}

/** @type {Teriock.Enrichment.EnricherConfig} */
const commandEnricher = {
  format: {
    aliases: Object.entries(TERIOCK.CONFIG.command).flatMap(([k, v]) => [k, ...(v.aliases ?? [])]),
    hasConfig: false,
    hasMultipleArguments: false,
    type: "roll",
  },
  id: "executeCommand",
  onRender: el => {
    if (el.dataset.enriched) { return; }
    el.dataset.enriched = "true";
    const target = el.firstElementChild;
    el.addEventListener("click", async ev => {
      await executeCommand(target, "take", ev);
    });
    el.addEventListener("contextmenu", async ev => {
      await executeCommand(target, "reverse", ev);
    });
  },
  process: async (parsed, options) => {
    const commands = game.teriock.commands;
    const key = commands.resolve(parsed.alias);
    const entry = TERIOCK.CONFIG.command[key];
    const payload = parsed.arguments.length ? parsed.arguments[0] : "";
    const commandOptions = commands.buildOptions(payload, key);
    await game.teriock.identifiers.initializing;
    return TeriockTextEditor.createAnchor({
      classes: ["teriock-inline-command"],
      dataset: {
        action: "executeCommand",
        command: key,
        relativeTo: options?.relativeTo?.uuid,
        tooltip: commandOptions.apply ? entry.numeric?.take : entry.numeric?.deal,
        ...objectMap(commandOptions, v => v.toString()),
      },
      icon: makeIconClass(commands.getValue(key, "icon", commandOptions), "inline"),
      name: parsed.label
        ?? (entry.numeric ? commandOptions.formula : _loc(commands.getValue(key, "label", commandOptions))),
    });
  },
};

export default commandEnricher;
