import { attack } from "./instances/attack.mjs";
import { createHelpCommand } from './instances/help.mjs';
import { damage } from "./instances/damage.mjs";
import { drain } from "./instances/drain.mjs";
import { endcon } from "./instances/endcon.mjs";
import { harm } from "./instances/harm.mjs";
import { heal } from "./instances/heal.mjs";
import { resist } from "./instances/resist.mjs";
import { revitalize } from "./instances/revitalize.mjs";
import { use } from "./instances/use.mjs";
import { wither } from "./instances/wither.mjs";

const commandList = [
  attack,
  damage,
  drain,
  endcon,
  harm,
  heal,
  resist,
  revitalize,
  use,
  wither,
];
const commandMap = {};
for (const command of commandList) {
  if (!command || typeof command.execute !== 'function') continue;

  commandMap[command.id] = command;
  for (const alias of command.aliases || []) {
    commandMap[alias] = command;
  }
}
commandMap['help'] = createHelpCommand(commandMap);

/**
 * Dispatches a chat command message to the appropriate TeriockCommand.
 * @param {string} message - The raw chat input (e.g., "/harm 1d6").
 * @param {Object} chatData - Foundry chat message data.
 * @param {User} sender - The user sending the message.
 * @returns {boolean} - `false` if a command handled the message, otherwise `true`
 */
export function dispatch(message, chatData, sender) {
  if (!message.startsWith('/')) return true;

  const targets = sender?.targets || new Set();
  const actors = Array.from(targets).map(t => t.actor).filter(Boolean);

  const [rawCommand, ...args] = message.slice(1).trim().split(/\s+/);
  const command = commandMap[rawCommand.toLowerCase()];

  if (command) {
    command.execute({ args, chatData, actors }).catch(console.error);
    return false;
  }
}