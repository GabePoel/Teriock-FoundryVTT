const { TokenHUD } = foundry.applications.hud;

export default class TeriockTokenHUD extends TokenHUD {
  static PARTS = {
    hud: {
      root: true,
      template: "teriock/hud/token-hud",
    },
  };
}
