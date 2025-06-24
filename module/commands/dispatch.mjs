import * as cmd from "./instances/_module.mjs";

const commandList = [
  cmd.attack,
  cmd.damage,
  cmd.drain,
  cmd.endcon,
  cmd.gaintemphp,
  cmd.gaintempmp,
  cmd.hack,
  cmd.harm,
  cmd.heal,
  cmd.kill,
  cmd.resist,
  cmd.revitalize,
  cmd.settemphp,
  cmd.settempmp,
  cmd.sleep,
  cmd.unhack,
  cmd.use,
  cmd.wither,
];
const commandMap = {};
for (const command of commandList) {
  if (!command || typeof command.execute !== "function") continue;

  commandMap[command.id] = command;
  for (const alias of command.aliases || []) {
    commandMap[alias] = command;
  }
}
commandMap["help"] = cmd.createHelpCommand(commandMap);

/**
 * Dispatches a chat command message to the appropriate TeriockCommand.
 * @param {string} message - The raw chat input (e.g., "/harm 1d6").
 * @param {Object} chatData - Foundry chat message data.
 * @param {User} sender - The user sending the message.
 * @returns {boolean} `false` if a command handled the message, otherwise `true`
 */
export function dispatch(message, chatData, sender) {
  if (!message.startsWith("/")) return true;

  const targets = sender?.targets || new Set();
  const actors = Array.from(targets)
    .map((t) => t.actor)
    .filter(Boolean);

  const [rawCommand, ...args] = message.slice(1).trim().split(/\s+/);
  const command = commandMap[rawCommand.toLowerCase()];

  if (command) {
    command.execute({ args, chatData, actors }).catch(console.error);
    return false;
  }
}
