import applicationHookEntries from "./application-hooks.mjs";
import timeHookEntries from "./time-hooks.mjs";
import tokenHookEntries from "./token-hooks.mjs";

/**
 * Register all hooks.
 */
export function registerHooks() {
  [...timeHookEntries, ...tokenHookEntries, ...applicationHookEntries].forEach(
    ([hook, handler]) => foundry.helpers.Hooks.on(hook, handler),
  );
}
