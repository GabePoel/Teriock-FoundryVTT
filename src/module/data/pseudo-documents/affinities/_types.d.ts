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
import { BaseAffinity } from "./abstract/_module.mjs";

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
  export type Affinity<T extends AffinityType = AffinityType> = AffinityTypeMap[T] & BaseAffinity;
}

export {};
