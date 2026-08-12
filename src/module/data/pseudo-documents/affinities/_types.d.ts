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

  export type AffinityType = TypeMapKey<AffinityTypeMap>;
  export type Affinity<T extends AffinityType = AffinityType> = AffinityTypeMap[T];

  namespace Teriock.Affinities {
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
      type: AffinityType;
      value: string;
    };
  }
}

export {};
