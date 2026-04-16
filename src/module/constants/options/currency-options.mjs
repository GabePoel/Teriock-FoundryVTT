import { preLocalize } from "../../helpers/localization.mjs";

export const currencyOptions = {
  copper: {
    abbreviation: "cop",
    label: "TERIOCK.TERMS.Currency.copper",
    value: 0.01,
    weight: 0.02,
  },
  silver: {
    abbreviation: "sil",
    label: "TERIOCK.TERMS.Currency.silver",
    value: 0.1,
    weight: 0.02,
  },
  gold: {
    abbreviation: "gol",
    label: "TERIOCK.TERMS.Currency.gold",
    value: 1,
    weight: 0.02,
  },
  entTearAmber: {
    abbreviation: "ent",
    label: "TERIOCK.TERMS.Currency.entTearAmber",
    value: 5,
    weight: 0.05,
  },
  fireEyeRuby: {
    abbreviation: "fir",
    label: "TERIOCK.TERMS.Currency.fireEyeRuby",
    value: 10,
    weight: 0.05,
  },
  pixiePlumAmethyst: {
    abbreviation: "pix",
    label: "TERIOCK.TERMS.Currency.pixiePlumAmethyst",
    value: 20,
    weight: 0.1,
  },
  snowDiamond: {
    abbreviation: "sno",
    label: "TERIOCK.TERMS.Currency.snowDiamond",
    value: 50,
    weight: 0.2,
  },
  dragonEmerald: {
    abbreviation: "dra",
    label: "TERIOCK.TERMS.Currency.dragonEmerald",
    value: 100,
    weight: 0.2,
  },
  moonOpal: {
    abbreviation: "moo",
    label: "TERIOCK.TERMS.Currency.moonOpal",
    value: 500,
    weight: 0.2,
  },
  magusQuartz: {
    abbreviation: "mag",
    label: "TERIOCK.TERMS.Currency.magusQuartz",
    value: 1000,
    weight: 0.2,
  },
  heartstoneRuby: {
    abbreviation: "hea",
    label: "TERIOCK.TERMS.Currency.heartstoneRuby",
    value: 5000,
    weight: 0.2,
  },
};

preLocalize("options.currency", { key: "label" });
