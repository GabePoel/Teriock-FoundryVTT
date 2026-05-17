/**
 * Make a hack command function.
 * @param {(actor: TeriockActor, part: Teriock.Keys.HackableBodyPart) => Promise<*>} operation
 * @returns {Teriock.Interaction.SimpleCommandFunction<Teriock.Interaction.HackOptions>}
 */
function fnFactory(operation) {
  return async function hackCommandFunction(a, o) {
    if (game.actors.check(a) && o?.part) await operation(a, o.part);
  };
}

const takeHack = fnFactory((a, p) => a.system.takeHack(p));
const takeUnhack = fnFactory((a, p) => a.system.takeUnhack(p));

/**
 * Hack command
 * @type {Teriock.Interaction.CommandEntry}
 */
export const hackCommand = {
  args: ["part"],
  icon: options => TERIOCK.config.hack[options?.part || "arm"].icon,
  id: "hack",
  label: options => TERIOCK.config.hack[options?.part || "arm"].label,
  primary: takeHack,
  secondary: takeUnhack,
};

/**
 * Unhack command
 * @type {Teriock.Interaction.CommandEntry}
 */
export const unhackCommand = {
  args: ["part"],
  icon: options => TERIOCK.config.hack[options?.part || "arm"].icon,
  id: "unhack",
  label: options => TERIOCK.config.hack[options?.part || "arm"].remove,
  primary: takeUnhack,
  secondary: takeHack,
};
