import { CommandActivationFactory } from "./abstract/_module.mjs";

/** Activations for every non-numeric command. */
export default Object.fromEntries(
  Object.entries(TERIOCK.CONFIG.command).filter(([, v]) => !v.numeric).map(([k]) => [k, CommandActivationFactory(k)]),
);
