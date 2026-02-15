/**
 * @param {TeriockActor} actor
 * @param {Teriock.Interaction.HackOptions} options
 * @returns {Promise<void>}
 */
async function takeHack(actor, options = {}) {
  const part = options.part || "arm";
  await actor.system.takeHack(part);
}

/**
 * @param {TeriockActor} actor
 * @param {Teriock.Interaction.HackOptions} options
 * @returns {Promise<void>}
 */
async function takeUnhack(actor, options = {}) {
  const part = options.part || "arm";
  await actor.system.takeUnhack(part);
}

/**
 * Hack command
 * @type {Teriock.Interaction.CommandEntry}
 */
export const hackCommand = {
  args: ["part"],
  icon: (options) => TERIOCK.options.hack[options?.part || "arm"].icon,
  id: "hack",
  label: (options) => TERIOCK.options.hack[options?.part || "arm"].label,
  primary: takeHack,
  secondary: takeUnhack,
};

/**
 * Unhack command
 * @type {Teriock.Interaction.CommandEntry}
 */
export const unhackCommand = {
  args: ["part"],
  icon: (options) => TERIOCK.options.hack[options?.part || "arm"].icon,
  id: "unhack",
  label: (options) =>
    TERIOCK.options.hack[options?.part || "arm"].label.replace(
      "Hack",
      "Unhack",
    ),
  primary: takeUnhack,
  secondary: takeHack,
};
