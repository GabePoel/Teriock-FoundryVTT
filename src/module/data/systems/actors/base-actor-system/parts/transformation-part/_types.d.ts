import { ActorTransformationConfig } from "../../../../../fields/helpers/_types.js";

declare global {
  namespace Teriock.Models {
    export type ActorTransformationPartData = {
      /** <base> Transformation */
      transformation: ActorTransformationConfig;
    };
  }
}

export {};
