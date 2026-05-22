import applicationHookEntries from "./application-hooks.mjs";
import timeHookEntries from "./time-hooks.mjs";
import tokenHookEntries from "./token-hooks.mjs";

/**
 * Register all hook listeners.
 */
export default function registerHookListeners() {
  [...timeHookEntries, ...tokenHookEntries, ...applicationHookEntries].forEach(([hook, handler]) =>
    foundry.helpers.Hooks.on(hook, handler)
  );
}
