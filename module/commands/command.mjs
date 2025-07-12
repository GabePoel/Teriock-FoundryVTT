/**
 * Parse roll-related flags from the argument list.
 * Strips known option flags and returns the rest as `rawArgs`.
 *
 * @param {string[]} args - Raw chat args
 * @returns {Teriock.ChatOptions} - Parsed options
 */
function parseRollOptions(args) {
  const optionFlags = ["advantage", "disadvantage", "twoHanded"];
  const options = {
    advantage: false,
    disadvantage: false,
    twoHanded: false,
    rawArgs: [],
  };

  for (const arg of args) {
    if (optionFlags.includes(arg)) {
      options[arg] = true;
    } else {
      options.rawArgs.push(arg);
    }
  }

  return options;
}

export default class TeriockCommand {
  /**
   * Create a new TeriockCommand instance.
   *
   * @param {string} id - Unique identifier for the command (e.g., "damage").
   * @param {string} docs - Help string for the command.
   * @param {Function} callback - Async function to run the command logic.
   * @param {Teriock.CommandOptions} options - Additional options for the command.
   */
  constructor(id, docs, callback, options = {}) {
    this.id = id;
    this.docs = docs;
    this.callback = callback;
    this.aliases = options.aliases || [];
    this.category = options.category || "general";
    this.requiresTarget = options.requiresTarget ?? false;
  }

  /**
   * Execute the command, handling roll options and common checks.
   *
   * @param {Object} context
   * @param {string[]} context.args - The arguments from the chat message.
   * @param {Object} context.chatData - The original chat message data.
   * @param {Actor[]} context.actors - Targeted actors.
   */
  async execute({ args, chatData, actors }) {
    if (this.requiresTarget && (!actors || actors.length === 0)) {
      ui.notifications.warn(`The "${this.id}" command requires at least one targeted token.`);
      return;
    }

    const rollOptions = parseRollOptions(args);

    try {
      await this.callback({
        args: rollOptions.rawArgs,
        options: rollOptions,
        chatData,
        actors,
      });
    } catch (err) {
      ui.notifications.error(`Error executing "/${this.id}" command.`);
    }
  }
}
