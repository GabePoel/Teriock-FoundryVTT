import { preLocalizeConfig } from "../../helpers/localization.mjs";
import images from "../display/images.mjs";

/** @enum {Teriock.Config.CurrencyEntry} */
// no sort
const currencyConfig = {
  copper: {
    conversion: 0.01,
    img: images.manifest.currency.copper,
    label: "TERIOCK.TERMS.Currency.copper",
    weight: 0.02,
  },
  silver: {
    conversion: 0.1,
    img: images.manifest.currency.silver,
    label: "TERIOCK.TERMS.Currency.silver",
    weight: 0.02,
  },
  gold: { conversion: 1, img: images.manifest.currency.gold, label: "TERIOCK.TERMS.Currency.gold", weight: 0.02 },
  entTearAmber: {
    conversion: 5,
    img: images.manifest.currency.entTearAmber,
    label: "TERIOCK.TERMS.Currency.entTearAmber",
    weight: 0.05,
  },
  fireEyeRuby: {
    conversion: 10,
    img: images.manifest.currency.fireEyeRuby,
    label: "TERIOCK.TERMS.Currency.fireEyeRuby",
    weight: 0.05,
  },
  pixiePlumAmethyst: {
    conversion: 20,
    img: images.manifest.currency.pixiePlumAmethyst,
    label: "TERIOCK.TERMS.Currency.pixiePlumAmethyst",
    weight: 0.1,
  },
  snowDiamond: {
    conversion: 50,
    img: images.manifest.currency.snowDiamond,
    label: "TERIOCK.TERMS.Currency.snowDiamond",
    weight: 0.2,
  },
  dragonEmerald: {
    conversion: 100,
    img: images.manifest.currency.dragonEmerald,
    label: "TERIOCK.TERMS.Currency.dragonEmerald",
    weight: 0.2,
  },
  moonOpal: {
    conversion: 500,
    img: images.manifest.currency.moonOpal,
    label: "TERIOCK.TERMS.Currency.moonOpal",
    weight: 0.2,
  },
  magusQuartz: {
    conversion: 1000,
    img: images.manifest.currency.magusQuartz,
    label: "TERIOCK.TERMS.Currency.magusQuartz",
    weight: 0.2,
  },
  heartstoneRuby: {
    conversion: 5000,
    img: images.manifest.currency.heartstoneRuby,
    label: "TERIOCK.TERMS.Currency.heartstoneRuby",
    weight: 0.2,
  },
};

export default currencyConfig;

preLocalizeConfig("config.currency", { key: "label" });
