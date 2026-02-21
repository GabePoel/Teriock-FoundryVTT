import { preLocalize } from "../../helpers/localization.mjs";

export const targets = {
  ancestors: "TERIOCK.CHANGES.Targets.ancestors",
  all: "TERIOCK.CHANGES.Targets.all",
};
preLocalize("options.change.targets");

export const time = {
  base: {
    hint: "TERIOCK.CHANGES.Time.base.hint",
    label: "TERIOCK.CHANGES.Time.base.label",
  },
  proficiency: {
    hint: "TERIOCK.CHANGES.Time.proficiency.hint",
    label: "TERIOCK.CHANGES.Time.proficiency.label",
  },
  fluency: {
    hint: "TERIOCK.CHANGES.Time.fluency.hint",
    label: "TERIOCK.CHANGES.Time.fluency.label",
  },
  normal: {
    hint: "TERIOCK.CHANGES.Time.normal.hint",
    label: "TERIOCK.CHANGES.Time.normal.label",
  },
  derivation: {
    hint: "TERIOCK.CHANGES.Time.derivation.hint",
    label: "TERIOCK.CHANGES.Time.derivation.label",
  },
  final: {
    hint: "TERIOCK.CHANGES.Time.final.hint",
    label: "TERIOCK.CHANGES.Time.final.label",
  },
};
preLocalize("options.change.time", { keys: ["hint", "label"] });

export const timeLabels = Object.fromEntries(
  Object.entries(time).map(([k, v]) => [k, v.label]),
);
preLocalize("options.change.timeLabels");
