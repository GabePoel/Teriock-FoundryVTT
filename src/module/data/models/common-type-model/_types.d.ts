import { TeriockActor, TeriockEffect, TeriockItem } from "../../../documents/_module.mjs";

export interface CommonTypeModelInterface {
  get parent(): TeriockActor | TeriockItem | TeriockEffect;
}

declare module "./common-type-model.mjs" {
  export default // @ts-ignore
  class CommonTypeModel implements CommonTypeModelInterface {}
}
