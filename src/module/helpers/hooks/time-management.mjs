export default function registerTimeManagementHooks() {
  foundry.helpers.Hooks.on(
    "updateWorldTime",
    async (_worldTime, dt, _options, userId) => {
      if (game.user.id === userId && game.user?.isActiveGM) {
        const scene = game.scenes.viewed;
        const tokens = scene.tokens;
        const actors = tokens.map((token) => token.actor);

        for (const actor of actors) {
          // Handle temporary effects expiration
          const effects = actor.temporaryEffects;
          for (const effect of effects) {
            if (typeof effect?.system?.checkExpiration === "function") {
              await effect?.system?.checkExpiration();
            }
          }

          // Update debt with interest if the actor has debt and an interest rate
          const currentDebt = actor.system.money?.debt || 0;
          const dailyInterestRate = actor.system.interestRate || 0;

          if (currentDebt > 0 && dailyInterestRate > 0) {
            // Calculate new debt after interest
            const daysElapsed = dt / 86400; // Convert seconds to days
            const newDebt =
              currentDebt * Math.pow(1 + dailyInterestRate, daysElapsed);

            // Update the actor's debt
            await actor.update({
              "system.money.debt": Math.round(newDebt * 100) / 100, // Round to 2 decimal places
            });
          }

          await actor.forceUpdate();
        }
      }
    },
  );
}
