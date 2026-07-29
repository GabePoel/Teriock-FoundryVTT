import {
  BindingAffinity,
  HexproofAffinity,
  HexsealAffinity,
  ImmunityAffinity,
  IncapabilityAffinity,
  ResistanceAffinity,
  TakeBoostAffinity,
  TakeDeboostAffinity,
  VulnerabilityAffinity,
} from "./_module.mjs";

declare global {
  export interface AffinityTypeMap {
    binding: BindingAffinity;
    hexproof: HexproofAffinity;
    hexseal: HexsealAffinity;
    immunity: ImmunityAffinity;
    resistance: ResistanceAffinity;
    takeBoost: TakeBoostAffinity;
    takeDeboost: TakeDeboostAffinity;
    vulnerability: VulnerabilityAffinity;
    incapability: IncapabilityAffinity;
  }

  namespace Teriock.Affinities {
    export type TypeMap = AffinityTypeMap;
    export type Type = TypeMapKey<AffinityTypeMap>;
    export type Any = AnyAffinity;

    /** The consolidated data an actor stores for each distinct affinity it has. */
    export type EntryData = {
      amount: number;
      category: Teriock.Keys.AffinityCategory;
      competence: Teriock.System.CompetenceLevel;
      img: string;
      /** Names of the things that grant this affinity, unioned across every source. */
      providers: string[];
      type: Type;
      value: string;
    };
  }
}
