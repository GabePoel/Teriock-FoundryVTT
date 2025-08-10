export default function registerTimeManagementHooks() {
  foundry.helpers.Hooks.on(
    "updateWorldTime",
    async (_worldTime, dt, _options, userId) => {
      if (game.user.id === userId && game.user?.isActiveGM) {
        const scene = game.scenes.viewed;
        const tokens = scene.tokens;
        /** @type {TeriockActor[]} */
        const actors = tokens.map((token) => token.actor);
        for (const actor of actors) {
          const numConsequences = actor.consequences.length;
          // Check if any consequences expire
          for (const effect of actor.consequences) {
            await effect.system.checkExpiration();
          }

          // Update debt with interest if the actor has debt and an interest rate
          const currentDebt = actor.system.money.debt || 0;
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

          if (actor.sheet._activeTab === "conditions" && numConsequences > 0) {
            await actor.forceUpdate();
          }
        }
      }
    },
  );
}
