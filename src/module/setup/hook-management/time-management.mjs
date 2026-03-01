import { timeOptions } from "../../constants/options/time-options.mjs";

/**
 * Get each {@link TeriockActor} in the current scene.
 * @returns {TeriockActor[]}
 */
function getActors() {
  return Array.from(
    game.scenes.viewed.tokens
      .filter((token) => token.actor)
      .map((token) => token.actor),
  );
}

export default function registerTimeManagementHooks() {
  foundry.helpers.Hooks.on(
    "updateWorldTime",
    async (_worldTime, dt, _options, userId) => {
      if (game.user.id === userId && game.user.isActiveGM) {
        for (const actor of getActors()) {
          for (const effect of actor.durationExpirationEffects) {
            await effect.system.checkExpiration();
          }
          if (actor.system.money.debt > 0 && actor.system.interestRate > 0) {
            const daysElapsed = dt / 86400;
            const newDebt =
              actor.system.money.debt *
              Math.pow(1 + actor.system.interestRate, daysElapsed);

            await actor.update({
              // Round to 2 decimal places
              "system.money.debt": Math.round(newDebt * 100) / 100,
            });
          }
        }
      }

      for (const actor of getActors()) {
        if (actor.isViewer && actor.sheet.rendered) {
          actor.sheet.render(true).then();
        }
      }
    },
  );

  for (const trigger of Object.keys(timeOptions.triggers)) {
    foundry.helpers.Hooks.on(`teriock.${trigger}`, async () => {
      for (const actor of getActors()) {
        if (game.user.id === actor.defaultUser.id) {
          actor?.fireTrigger(trigger).then();
        }
      }
    });
  }
}
