import statConfig from "../constants/config/stat-config.mjs";
import transformationConfig from "../constants/config/transformation-config.mjs";
import { CompetenceModel } from "../data/models/_module.mjs";

declare global {
  namespace Teriock.Transformation {
    export type SpeciesTransformationConfig = {
      /** <schema> Overriding image to apply */
      img: Teriock.System.ImageString;
      /** <schema> Override whether the token has a ring */
      ring: boolean;
      /** <schema> A distinct image to use if there's a ring */
      ringImg: Teriock.System.ImageString;
    };

    export type ActorTransformationConfig = SpeciesTransformationConfig & {
      /** <schema> The primary transformation effect */
      primary: TeriockLingering | null;
    };

    export type AutomationTransformationConfig = SpeciesTransformationConfig & {
      /** <schema> Level of transformation */
      level: Teriock.Keys.TransformationLevel | null;
      /** <schema> Additional parameters this transformation should override */
      override: Set<keyof typeof transformationConfig.override>;
      /** <schema> Stats this transformation should reset */
      resets: Set<
        {
          [K in keyof typeof statConfig]: typeof statConfig[K] extends { transformationReset: object } ? K : never;
        }[keyof typeof statConfig]
      >;
      /** <schema> Types of documents this transformation should turn off */
      suppress: Set<keyof typeof transformationConfig.suppress>;
    };

    export type EffectTransformationConfig = AutomationTransformationConfig & {
      /** <schema> Competence to override with */
      competence: CompetenceModel;
      /** <schema> Whether transformation is enabled */
      enabled: boolean;
      /** <schema> The primary transformation species */
      primary: TeriockSpecies | null;
      /** <schema> UUID of specific species to transform into */
      uuids: UUID<TeriockSpecies>[];
    };
  }
}

export {};
