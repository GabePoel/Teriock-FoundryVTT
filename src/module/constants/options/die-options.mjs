import { preLocalize } from "../../helpers/localization.mjs";

export const dieOptions = {
  deathBagStoneColor: {
    black: "TERIOCK.TERMS.StoneColor.black",
    blue: "TERIOCK.TERMS.StoneColor.blue",
    green: "TERIOCK.TERMS.StoneColor.green",
    red: "TERIOCK.TERMS.StoneColor.red",
    white: "TERIOCK.TERMS.StoneColor.white",
  },
  faces: {
    2: "d2",
    4: "d4",
    6: "d6",
    8: "d8",
    10: "d10",
    12: "d12",
    20: "d20",
    100: "d100",
  },
  stats: {
    hp: "hit",
    mp: "mana",
  },
  styles: {
    amonum: {
      colorset: "bronze",
    },
    dirtydark: {
      colorset: "custom",
      foreground: "#dddddd",
      background: "#3d3846",
      texture: "skulls",
    },
    financial: {
      colorset: "custom",
      background: "#F6D32D",
      foreground: "#ffffff",
      outline: "#000000",
      texture: "bronze03a",
      material: "metal",
    },
    fire: {
      colorset: "fire",
    },
    holy: {
      colorset: "radiant",
    },
    hp: {
      colorset: "red",
    },
    ice: {
      colorset: "ice",
    },
    mana: {
      colorset: "force",
    },
    morganti: {
      colorset: "black",
    },
    mp: {
      colorset: "blue",
    },
    psychic: {
      colorset: "psychic",
    },
    silveel: {
      colorset: "prism",
      background: "#ffffff",
      foreground: "#F6F5F4",
      outline: "#5E5C64",
      texture: "metal",
    },
    silver: {
      colorset: "custom",
      background: "#deddda",
      foreground: "#000000",
      outline: "#ffffff",
      texture: "metal",
    },
    spiritual: {
      colorset: "thunder",
    },
    terror: {
      colorset: "poison",
    },
    toxic: {
      colorset: "acid",
    },
    vine: {
      colorset: "earth",
    },
  },
};

preLocalize("options.die.deathBagStoneColor");
