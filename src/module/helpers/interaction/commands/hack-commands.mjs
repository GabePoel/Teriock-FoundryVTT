/**
 * Make a hack command function.
 * @param {(actor: TeriockActor, part: Teriock.Keys.HackableBodyPart) => Promise<*>} operation
 * @returns {Teriock.Interaction.SimpleCommandFunction<Teriock.Interaction.HackOptions>}
 */
function fnFactory(operation) {
  return async function hackCommandFunction(a, o) {
    if (game.actors.check(a) && o?.part) {
      await operation(a, o.part);
    }
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
  id: "hack",
  primary: takeHack,
  secondary: takeUnhack,
  icon: options => TERIOCK.config.hack[options?.part || "arm"].icon,
  label: options => TERIOCK.config.hack[options?.part || "arm"].label,
};

/**
 * Unhack command
 * @type {Teriock.Interaction.CommandEntry}
 */
export const unhackCommand = {
  args: ["part"],
  id: "unhack",
  primary: takeUnhack,
  secondary: takeHack,
  icon: options => TERIOCK.config.hack[options?.part || "arm"].icon,
  label: options => TERIOCK.config.hack[options?.part || "arm"].remove,
};
