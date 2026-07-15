import {
  BindingAffinity,
  HexproofAffinity,
  HexsealAffinity,
  ImmunityAffinity,
  ResistanceAffinity,
  TakeBoostAffinity,
  TakeDeboostAffinity,
  VulnerabilityAffinity,
} from "./_module.mjs";

declare global {
  namespace Teriock.Affinities {
    export interface TypeMap {
      binding: BindingAffinity;
      hexproof: HexproofAffinity;
      hexseal: HexsealAffinity;
      immunity: ImmunityAffinity;
      resistance: ResistanceAffinity;
      takeBoost: TakeBoostAffinity;
      takeDeboost: TakeDeboostAffinity;
      vulnerability: VulnerabilityAffinity;
    }

    export type Type = keyof TypeMap;
    export type Any = TypeMap[Type];

    /** The consolidated data an actor stores for each distinct affinity it has. */
    export type EntryData = {
      /** The stored image, read back through `FakeAffinityModel#img`. */
      _img: string;
      amount: number;
      category: Teriock.Keys.AffinityCategory;
      competence: Teriock.System.CompetenceLevel;
      /** The things that grant this affinity, unioned across every source. */
      providers: string[];
      type: Type;
      value: string;
    };
  }
}
