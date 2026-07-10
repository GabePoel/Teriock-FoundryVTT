import { preLocalizeConfig } from "../../helpers/localization.mjs";

const usableContext = {
  c: "TERIOCK.ROLL_CONTEXT.Common.c",
  flu: "TERIOCK.SCHEMA.Competence.choices.2",
  pro: "TERIOCK.SCHEMA.Competence.choices.1",
};

export default usableContext;

preLocalizeConfig("rollContext.usable");
