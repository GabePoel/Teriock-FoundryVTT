import { preLocalizeConfig } from "../../helpers/localization.mjs";

export default {
  deathBagStoneColor: {
    black: "TERIOCK.TERMS.StoneColor.black",
    blue: "TERIOCK.TERMS.StoneColor.blue",
    green: "TERIOCK.TERMS.StoneColor.green",
    red: "TERIOCK.TERMS.StoneColor.red",
    white: "TERIOCK.TERMS.StoneColor.white",
  },
  // no sort
  faces: { 2: "d2", 4: "d4", 6: "d6", 8: "d8", 10: "d10", 12: "d12", 20: "d20", 100: "d100" },
  stats: { hp: "hit", mp: "mana" },
  styles: { hp: { colorset: "red" }, mp: { colorset: "blue" } },
};

preLocalizeConfig("config.die.deathBagStoneColor");
