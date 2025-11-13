import TeriockBaseItemModel from "../base-item-model/base-item-model.mjs";
import { TeriockMount } from "../../../documents/_documents.mjs";
import { StatGiverMixinInterface } from "../../mixins/stat-giver-data-mixin/_types";

declare module "./mount-model.mjs" {
  export default interface TeriockMountModel
    extends StatGiverMixinInterface,
      TeriockBaseItemModel {
    /** <schema> Mount species or type */
    mountType: string;
    /** <schema> If mount is mounted */
    mounted: boolean;

    get parent(): TeriockMount;
  }
}
