import { preLocalizeConfig } from "../../helpers/localization.mjs";

/** @enum {Teriock.Config.CurrencyEntry} */
// no sort
const currencyConfig = {
  copper: { conversion: 0.01, label: "TERIOCK.TERMS.Currency.copper", weight: 0.02 },
  silver: { conversion: 0.1, label: "TERIOCK.TERMS.Currency.silver", weight: 0.02 },
  gold: { conversion: 1, label: "TERIOCK.TERMS.Currency.gold", weight: 0.02 },
  entTearAmber: { conversion: 5, label: "TERIOCK.TERMS.Currency.entTearAmber", weight: 0.05 },
  fireEyeRuby: { conversion: 10, label: "TERIOCK.TERMS.Currency.fireEyeRuby", weight: 0.05 },
  pixiePlumAmethyst: { conversion: 20, label: "TERIOCK.TERMS.Currency.pixiePlumAmethyst", weight: 0.1 },
  snowDiamond: { conversion: 50, label: "TERIOCK.TERMS.Currency.snowDiamond", weight: 0.2 },
  dragonEmerald: { conversion: 100, label: "TERIOCK.TERMS.Currency.dragonEmerald", weight: 0.2 },
  moonOpal: { conversion: 500, label: "TERIOCK.TERMS.Currency.moonOpal", weight: 0.2 },
  magusQuartz: { conversion: 1000, label: "TERIOCK.TERMS.Currency.magusQuartz", weight: 0.2 },
  heartstoneRuby: { conversion: 5000, label: "TERIOCK.TERMS.Currency.heartstoneRuby", weight: 0.2 },
};

export default currencyConfig;

preLocalizeConfig("config.currency", { key: "label" });
