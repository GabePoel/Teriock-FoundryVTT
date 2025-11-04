import { systemPath } from "../../helpers/path.mjs";

const { TokenHUD } = foundry.applications.hud;

export default class TeriockTokenHUD extends TokenHUD {
  static PARTS = {
    hud: {
      root: true,
      template: systemPath("templates/hud/token-hud.hbs"),
    },
  };
}
