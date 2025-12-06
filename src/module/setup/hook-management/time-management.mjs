/**
 * Get each {@link TeriockActor} in the current scene.
 * @returns {Immutable.Collection<UUID<TeriockTokenDocument>, TeriockActor>}
 */
function getActors() {
  return game.scenes.viewed.tokens
    .filter((token) => token.actor)
    .map((token) => token.actor);
}

export default function registerTimeManagementHooks() {
  foundry.helpers.Hooks.on(
    "updateWorldTime",
    async (_worldTime, dt, _options, userId) => {
      const user = game.user;
      if (user.id === userId && user.isActiveGM) {
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
    },
  );

  foundry.helpers.Hooks.on("teriock.dawn", async () => {
    const user = game.user;
    if (user.isActiveGM) {
      for (const actor of getActors()) {
        for (const effect of actor.dawnExpirationEffects) {
          await effect.system.expire();
        }
      }
    }
  });
}
