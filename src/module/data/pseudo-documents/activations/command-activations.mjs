import { CommandActivationFactory } from "./abstract/_module.mjs";

/** Activations for every command that isn't numeric keyed by command. Attack has its own activation. */
export const commandActivations = Object.fromEntries(
  Object.entries(TERIOCK.CONFIG.command).filter(([k, v]) => !v.numeric && k !== "attack").map((
    [k],
  ) => [k, CommandActivationFactory(k)]),
);
