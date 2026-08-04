import { preLocalizeConfig } from "../../helpers/localization.mjs";
import { colors } from "../display/colors.mjs";
import { icons } from "../display/icons.mjs";

const childKinds = /** @enum {Teriock.Config.KindEntry} */ {
  flaw: { color: colors.palette.red, icon: icons.kind.flaw, label: "TERIOCK.TERMS.Kind.flaw" },
  other: { color: colors.palette.brown, icon: icons.kind.other, label: "TERIOCK.TERMS.Kind.other" },
  unknown: { color: colors.palette.grey, icon: icons.kind.unknown, label: "TERIOCK.TERMS.Kind.unknown" },
};

export default {
  baseValues: { ac: 10, f: 1, maxCurses: 3, p: 0, size: 3 },
  childKinds,
  defaultKinds: /** @enum {Teriock.Config.KindEntry} */ {
    normal: { color: colors.palette.green, icon: icons.kind.normal, label: "TERIOCK.TERMS.Kind.normal" },
    ...childKinds,
  },
  inf: 999999999999999,
  infCode: "\u2009\u{F06E4}",
  resistanceThreshold: 10,
  safeInf: 99,
  target: { limb: 2, vitals: 3 },
  timeout: { writeOperation: 5 * 1000 },
  unitPrecision: 0.01,
};

preLocalizeConfig("config.system.childKinds", { keys: ["label"] });
preLocalizeConfig("config.system.defaultKinds", { keys: ["label"] });
