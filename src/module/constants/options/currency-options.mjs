import { preLocalize } from "../../helpers/localization.mjs";

export const currencyOptions = {
  copper: {
    name: "TERIOCK.TERMS.Currency.copper",
    value: 0.01,
    weight: 0.02,
  },
  silver: {
    name: "TERIOCK.TERMS.Currency.silver",
    value: 0.1,
    weight: 0.02,
  },
  gold: {
    name: "TERIOCK.TERMS.Currency.gold",
    value: 1,
    weight: 0.02,
  },
  entTearAmber: {
    name: "TERIOCK.TERMS.Currency.entTearAmber",
    value: 5,
    weight: 0.05,
  },
  fireEyeRuby: {
    name: "TERIOCK.TERMS.Currency.fireEyeRuby",
    value: 10,
    weight: 0.05,
  },
  pixiePlumAmethyst: {
    name: "TERIOCK.TERMS.Currency.pixiePlumAmethyst",
    value: 20,
    weight: 0.1,
  },
  snowDiamond: {
    name: "TERIOCK.TERMS.Currency.snowDiamond",
    value: 50,
    weight: 0.2,
  },
  dragonEmerald: {
    name: "TERIOCK.TERMS.Currency.dragonEmerald",
    value: 100,
    weight: 0.2,
  },
  moonOpal: {
    name: "TERIOCK.TERMS.Currency.moonOpal",
    value: 500,
    weight: 0.2,
  },
  magusQuartz: {
    name: "TERIOCK.TERMS.Currency.magusQuartz",
    value: 1000,
    weight: 0.2,
  },
  heartstoneRuby: {
    name: "TERIOCK.TERMS.Currency.heartstoneRuby",
    value: 5000,
    weight: 0.2,
  },
};

preLocalize("options.currency", { key: "name" });
