import { CompetenceModel } from "../data/models/_module.mjs";
import morphConfig from "../static/config/morph-config.mjs";

declare global {
  /** @category Morph */
  namespace Teriock.Morph {
    export type SpeciesMorphConfig = {
      /** <schema> Overriding image to apply */
      img: Teriock.System.ImageString;
      /** <schema> Override whether the token has a ring */
      ring: boolean;
      /** <schema> A distinct image to use if there's a ring */
      ringImg: Teriock.System.ImageString;
    };

    export type ActorMorphConfig = {
      /** <schema> The primary morph effect */
      primary: TeriockActiveEffect<"condition" | "consequence" | "holiday"> | null;
    };

    export type AutomationMorphConfig = SpeciesMorphConfig & {
      /** <schema> Attributes this morph should change */
      attributes: Set<Teriock.Keys.Attribute>;
      /** <schema> Additional parameters this morph should override */
      override: Set<keyof typeof morphConfig.override>;
      /** <schema> Stats this morph should reset */
      resets: Set<Teriock.Keys.Stat>;
      /** <schema> Types of documents this morph should turn off */
      suppress: Set<keyof typeof morphConfig.suppress>;
    };

    export type EffectMorphConfig = AutomationMorphConfig & {
      /** <schema> Competence to override with */
      competence: CompetenceModel;
      /** <schema> Whether morph is enabled */
      enabled: boolean;
      /** <schema> The primary morph species */
      primary: TeriockItem<"species"> | null;
    };
  }
}

export {};
