import type { ArmamentDataMixinInterface } from "../../mixins/armament-data-mixin/_types";

declare module "./body-model.mjs" {
  export default interface TeriockBodyModel extends ArmamentDataMixinInterface {
    get parent(): TeriockBody;
  }
}

export {};
