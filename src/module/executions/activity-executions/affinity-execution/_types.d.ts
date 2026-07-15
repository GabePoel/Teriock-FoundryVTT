import { FakeAffinityModel } from "../../../data/models/_module.mjs";

declare global {
  namespace Teriock.Execution {
    export type AffinityExecutionOptions = ExecutionOptions & {
      /** The specific affinity being rolled, when the roll came from one. */
      affinity?: FakeAffinityModel | null;
      type?: Teriock.Affinities.Type;
      wrappers?: string[];
    };
  }
}

export {};
