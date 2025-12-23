import "./parts/_types";
import "./_parameters";
import { TeriockActor } from "../../../documents/_module.mjs";

declare global {
  namespace Teriock.Models {
    export interface TeriockBaseActorModelInterface
      extends Teriock.Models.CommonTypeModelInterface {
      get parent(): TeriockActor;
    }
  }
}
