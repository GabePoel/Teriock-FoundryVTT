import {
  AdeptitudeAffinity,
  BindingAffinity,
  HexproofAffinity,
  HexsealAffinity,
  ImmunityAffinity,
  IncapabilityAffinity,
  IneptitudeAffinity,
  ResistanceAffinity,
  TakeBoostAffinity,
  TakeDeboostAffinity,
  VulnerabilityAffinity,
} from "./_module.mjs";

declare global {
  export interface AffinityTypeMap {
    adeptitude: AdeptitudeAffinity;
    binding: BindingAffinity;
    hexproof: HexproofAffinity;
    hexseal: HexsealAffinity;
    immunity: ImmunityAffinity;
    resistance: ResistanceAffinity;
    takeBoost: TakeBoostAffinity;
    takeDeboost: TakeDeboostAffinity;
    vulnerability: VulnerabilityAffinity;
    incapability: IncapabilityAffinity;
    ineptitude: IneptitudeAffinity;
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
      /** UUIDs of the documents that grant this affinity. */
      sources: UUID<TeriockDocument>[];
      type: Type;
      value: string;
    };
  }
}

export {};
