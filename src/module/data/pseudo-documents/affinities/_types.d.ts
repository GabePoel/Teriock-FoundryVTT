import affinityConfig from "../../../static/config/affinity-config.mjs";
import { BaseAffinity } from "./abstract/_module.mjs";

declare global {
  export type AffinityTypeMap = Record<keyof typeof affinityConfig.types, BaseAffinity>;
  export type AffinityType = TypeMapKey<AffinityTypeMap>;
  export type Affinity<T extends AffinityType = AffinityType> = AffinityTypeMap[T] & BaseAffinity;
}

export {};
