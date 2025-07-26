import TeriockCommand from "../command.mjs";

/**
 * Creates a dynamic help command based on all registered commands.
 * Filters out aliases to avoid duplicate entries.
 * @param {Object} allCommands - An object containing all registered commands.
 * @returns {TeriockCommand} - The help command instance.
 */
export function createHelpCommand(allCommands) {
  // Filter to unique commands (skip aliases)
  const uniqueCommands = Object.values(allCommands).filter(
    (cmd, index, arr) =>
      arr.findIndex((other) => other.id === cmd.id) === index,
  );

  return new TeriockCommand(
    "help",
    "List all available Teriock chat commands.",
    async ({ chatData }) => {
      const helpHTML = uniqueCommands
        .sort((a, b) => a.id.localeCompare(b.id))
        .map((cmd) => {
          const aliases =
            cmd.aliases.length > 0
              ? ` <span class="aliases">(aliases: ${cmd.aliases.map((a) => `/${a}`).join(", ")})</span>`
              : "";
          const category = cmd.category
            ? `<span class="category">[${cmd.category}]</span>`
            : "";
          return `
            <div class="teriock-chat-help">
              <code>/${cmd.id}</code>${aliases} ${category}
              <div class="help-docs">${cmd.docs}</div>
            </div>
          `;
        })
        .join("");

      await ChatMessage.create({
        content: `
          <div class="teriock">
            <div class="teriock-chat-help-container">
              ${helpHTML}
            </div>
          </div>
        `,
        whisper: [chatData.user],
        flavor: "Teriock Chat Commands",
      });
    },
    {
      category: "#system",
    },
  );
}
