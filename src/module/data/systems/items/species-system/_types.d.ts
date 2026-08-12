declare module "./species-system.mjs" {
  export default interface SpeciesSystem
    extends Teriock.Models.SpeciesStatIncreaseFields, Teriock.Models.SpeciesTransformationPartData
  {
    /** <schema> Age of maturity */
    adult: number;
    /** <schema> Appearance */
    appearance: string;
    /** <schema> Attribute increase */
    attributeIncrease: string;
    /** <schema> Battle rating */
    br: number;
    /** <schema> Innate ranks */
    innateRanks: string;
    /** <schema> Maximum lifespan */
    lifespan: number | null;
    /** <schema> Size constraints */
    size: Teriock.Fields.BarField & {
      /** <schema> Enabled */
      enabled: boolean;
    };
    /** <schema> Traits */
    traits: Set<Teriock.Keys.Trait>;
  }
}

declare global {
  namespace Teriock.Models {
    export type SpeciesStatIncreaseFields = { [K in Teriock.Keys.DieStat as `${K}Increase`]: string; };
  }
}

export {};
