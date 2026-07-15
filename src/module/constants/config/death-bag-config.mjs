import { preLocalizeConfig } from "../../helpers/localization.mjs";

export default {
  stones: {
    black: { initial: true, label: "TERIOCK.TERMS.StoneColor.black", number: 3 },
    blue: { label: "TERIOCK.TERMS.StoneColor.blue", number: 0 },
    green: { label: "TERIOCK.TERMS.StoneColor.green", number: 0 },
    red: { initial: true, label: "TERIOCK.TERMS.StoneColor.red", number: 10 },
    white: { initial: true, label: "TERIOCK.TERMS.StoneColor.white", number: 20 },
  },
};

preLocalizeConfig("config.deathBag.stones", { key: "label" });
