import { EvaluationModel } from "../../../../../models/_module.mjs";
import type { characterOptions } from "../../../../../../constants/options/character-options.mjs";

export type ActorSensesPartInterface = {
  /** <schema> Detection parameters */
  detection: {
    /** <schema> Hiding based on sneak */
    hiding: EvaluationModel;
    /** <schema> Perceiving based on perception */
    perceiving: EvaluationModel;
  };
  /** <base> */
  light: typeof characterOptions.defaultLight;
  /** <schema> Senses */
  senses: {
    /** <schema> Blind fighting */
    blind: number;
    /** <schema> Dark vision */
    dark: number;
    /** <schema> Ethereal vision */
    ethereal: number;
    /** <schema> Advanced hearing */
    hearing: number;
    /** <schema> See invisible */
    invisible: number;
    /** <schema> Night vision */
    night: number;
    /** <schema> Advanced sight */
    sight: number;
    /** <schema> Advanced smell */
    smell: number;
    /** <schema> True sight */
    truth: number;
    /** <schema> Ethereal light */
    etherealLight: number;
  };
};
