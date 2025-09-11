/**
 * Get each {@link TeriockActor} in the current scene.
 *
 * @returns {TeriockActor[]}
 */
function getActors() {
  return game.scenes.viewed.tokens
    .filter((token) => token.actor)
    .map((token) => token.actor);
}

export default function registerTimeManagementHooks() {
  foundry.helpers.Hooks.on("updateWorldTime", async (_worldTime, dt, _options, userId) => {
    if (game.user.id === userId && game.user?.isActiveGM) {
      for (const actor of getActors()) {
        const num = actor.durationExpirationEffects.length;
        for (const effect of actor.durationExpirationEffects) {
          await effect.system.checkExpiration();
        }

        if (actor.system.money.debt > 0 && actor.system.interestRate > 0) {
          const daysElapsed = dt / 86400;
          const newDebt = actor.system.money.debt * Math.pow(1 + actor.system.interestRate, daysElapsed);

          await actor.update({
            // Round to 2 decimal places
            "system.money.debt": Math.round(newDebt * 100) / 100,
          });
        }
        if (num > 0) {
          await actor.forceUpdate();
        }
      }
    }
  });

  foundry.helpers.Hooks.on("teriock.dawn", async () => {
    if (game.user?.isActiveGM) {
      for (const actor of getActors()) {
        for (const effect of actor.dawnExpirationEffects) {
          await effect.system.expire();
        }
      }
    }
  });
}
