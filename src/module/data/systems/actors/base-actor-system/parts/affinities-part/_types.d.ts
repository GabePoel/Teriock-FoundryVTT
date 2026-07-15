import { FakeAffinityModel } from "../../../../../models/_module.mjs";

declare global {
  namespace Teriock.Models {
    export type ActorAffinitiesPartData = {
      /** <base> Affinities, keyed by a hash of their type, category, and value */
      affinities: Record<ID<FakeAffinityModel>, FakeAffinityModel>;
    };
  }
}

export {};
