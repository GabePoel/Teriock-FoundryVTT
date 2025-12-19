import { ArmamentDataMixinInterface } from "../../mixins/armament-data-mixin/_types";

declare global {
  namespace Teriock.Models {
    export interface TeriockBodyModelInterface
      extends Teriock.Models.TeriockBaseItemModelInterface,
        ArmamentDataMixinInterface {
      get parent(): TeriockBody;
    }
  }
}
