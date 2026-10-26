import { preLocalizeObject } from "../../helpers/localization.mjs";
import * as thumbnails from "../display/thumbnails/_module.mjs";

/** @enum {Teriock.Config.CurrencyEntry} */
// no sort
const currencyConfig = {
  copper: {
    conversion: 0.01,
    equipmentType: "coin",
    identifier: "copper",
    img: thumbnails.manifest.currency.copper,
    label: "TERIOCK.TERMS.Currency.copper",
    symbol: "cp",
    weight: 0.02,
  },
  silver: {
    conversion: 0.1,
    equipmentType: "coin",
    identifier: "silver",
    img: thumbnails.manifest.currency.silver,
    label: "TERIOCK.TERMS.Currency.silver",
    symbol: "sp",
    weight: 0.02,
  },
  gold: {
    conversion: 1,
    equipmentType: "coin",
    identifier: "gold",
    img: thumbnails.manifest.currency.gold,
    label: "TERIOCK.TERMS.Currency.gold",
    symbol: "gp",
    weight: 0.02,
  },
  entTearAmber: {
    conversion: 5,
    equipmentType: "gemstone",
    identifier: "ent-tear-amber",
    img: thumbnails.manifest.currency.entTearAmber,
    label: "TERIOCK.TERMS.Currency.entTearAmber",
    symbol: "ea",
    weight: 0.05,
  },
  fireEyeRuby: {
    conversion: 10,
    equipmentType: "gemstone",
    identifier: "fire-eye-ruby",
    img: thumbnails.manifest.currency.fireEyeRuby,
    label: "TERIOCK.TERMS.Currency.fireEyeRuby",
    symbol: "fr",
    weight: 0.05,
  },
  pixiePlumAmethyst: {
    conversion: 20,
    equipmentType: "gemstone",
    identifier: "pixie-plum-amethyst",
    img: thumbnails.manifest.currency.pixiePlumAmethyst,
    label: "TERIOCK.TERMS.Currency.pixiePlumAmethyst",
    symbol: "pa",
    weight: 0.1,
  },
  snowDiamond: {
    conversion: 50,
    equipmentType: "gemstone",
    identifier: "snow-diamond",
    img: thumbnails.manifest.currency.snowDiamond,
    label: "TERIOCK.TERMS.Currency.snowDiamond",
    symbol: "sd",
    weight: 0.2,
  },
  dragonEmerald: {
    conversion: 100,
    equipmentType: "gemstone",
    identifier: "dragon-emerald",
    img: thumbnails.manifest.currency.dragonEmerald,
    label: "TERIOCK.TERMS.Currency.dragonEmerald",
    symbol: "de",
    weight: 0.2,
  },
  moonOpal: {
    conversion: 500,
    equipmentType: "gemstone",
    identifier: "moon-opal",
    img: thumbnails.manifest.currency.moonOpal,
    label: "TERIOCK.TERMS.Currency.moonOpal",
    symbol: "mo",
    weight: 0.2,
  },
  magusQuartz: {
    conversion: 1000,
    equipmentType: "gemstone",
    identifier: "magus-quartz",
    img: thumbnails.manifest.currency.magusQuartz,
    label: "TERIOCK.TERMS.Currency.magusQuartz",
    symbol: "mq",
    weight: 0.2,
  },
  heartstoneRuby: {
    conversion: 5000,
    equipmentType: "gemstone",
    identifier: "heartstone-ruby",
    img: thumbnails.manifest.currency.heartstoneRuby,
    label: "TERIOCK.TERMS.Currency.heartstoneRuby",
    symbol: "hr",
    weight: 0.2,
  },
};

export default currencyConfig;

preLocalizeObject("CONFIG.currency", { key: "label" });
