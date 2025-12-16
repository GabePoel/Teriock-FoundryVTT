//noinspection JSUnresolvedReference

export default function registerTokenManagementHooks() {
  foundry.helpers.Hooks.on(
    "moveToken",
    async (document, _movement, _operation, user) => {
      if (document.checkEditor(user) && document.actor) {
        const data = await document.actor.hookCall("movement");
        if (data.cancel) {
          return false;
        }
        for (const e of document.actor.movementExpirationEffects) {
          await e.system.expire();
        }
      }
    },
  );

  foundry.helpers.Hooks.on("applyTokenStatusEffect", (token) => {
    const actor = token.actor;
    if (actor) {
      actor.prepareDerivedData();
    }
  });

  foundry.helpers.Hooks.on(
    "applyTokenStatusEffect",
    async (token, statusId, active) => {
      const activeGM = game.users.activeGM;
      let tokenEditor;
      const user = game.user;
      if (activeGM) {
        tokenEditor = Boolean(user.isActiveGM);
      } else {
        tokenEditor = token.isOwner;
      }
      if (
        token.document.getSetting("autoMagic") &&
        game.modules.get("tokenmagic")?.active &&
        game.settings.get("teriock", "automaticTokenMagicConditionEffects") &&
        tokenEditor
      ) {
        if (Object.keys(TERIOCK.display.tokenMagic).includes(statusId)) {
          const params = TERIOCK.display.tokenMagic[statusId];
          if (active) {
            //eslint-disable-next-line no-undef
            await TokenMagic.addFilters(token, [params]);
          } else {
            //eslint-disable-next-line no-undef
            await TokenMagic.deleteFilters(token, params.filterId);
          }
        }
      }
    },
  );
}
