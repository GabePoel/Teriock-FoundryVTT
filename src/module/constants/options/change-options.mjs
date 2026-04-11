import { preLocalize } from "../../helpers/localization.mjs";

export const targets = {
  ancestors: "TERIOCK.CHANGES.Targets.ancestors",
  all: "TERIOCK.CHANGES.Targets.all",
};
preLocalize("options.change.targets");

export const phase = {
  proficiency: {
    hint: "TERIOCK.CHANGES.Phase.proficiency.hint",
    label: "TERIOCK.CHANGES.Phase.proficiency.label",
  },
  fluency: {
    hint: "TERIOCK.CHANGES.Phase.fluency.hint",
    label: "TERIOCK.CHANGES.Phase.fluency.label",
  },
  normal: {
    hint: "TERIOCK.CHANGES.Phase.normal.hint",
    label: "TERIOCK.CHANGES.Phase.normal.label",
  },
  derivation: {
    hint: "TERIOCK.CHANGES.Phase.derivation.hint",
    label: "TERIOCK.CHANGES.Phase.derivation.label",
  },
  completion: {
    hint: "TERIOCK.CHANGES.Phase.final.hint",
    label: "TERIOCK.CHANGES.Phase.final.label",
  },
};

preLocalize("options.change.phase", { keys: ["hint", "label"] });
