import { preLocalizeConfig } from "../../helpers/localization.mjs";

export default {
  deathBagStoneColor: {
    black: { initial: true, label: "TERIOCK.TERMS.StoneColor.black", number: 3 },
    blue: { label: "TERIOCK.TERMS.StoneColor.blue", number: 0 },
    green: { label: "TERIOCK.TERMS.StoneColor.green", number: 0 },
    red: { initial: true, label: "TERIOCK.TERMS.StoneColor.red", number: 10 },
    white: { initial: true, label: "TERIOCK.TERMS.StoneColor.white", number: 20 },
  },
  // no sort
  faces: { 2: "d2", 4: "d4", 6: "d6", 8: "d8", 10: "d10", 12: "d12", 20: "d20", 100: "d100" },
  stats: { hp: "hit", mp: "mana" },
  styles: { hp: { colorset: "red" }, mp: { colorset: "blue" } },
};

preLocalizeConfig("config.die.deathBagStoneColor", { key: "label" });
