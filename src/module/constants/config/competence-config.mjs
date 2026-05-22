import { preLocalize } from "../../helpers/localization.mjs";

export const competenceConfig = {
  levels: {
    0: { label: "TERIOCK.SCHEMA.Competence.choices.0", page: "Competency Bonus" },
    1: { label: "TERIOCK.SCHEMA.Competence.choices.1", page: "Proficiency Bonus" },
    2: { label: "TERIOCK.SCHEMA.Competence.choices.2", page: "Fluency Bonus" },
  },
};

preLocalize("config.competence.levels", { keys: ["label"], sort: false });
