import type TeriockBaseItemModel from "../base-item-data/base-item-data.mjs";
import type { TeriockMount } from "../../../documents/_documents.mjs";
import type { StatGiverMixinInterface } from "../../mixins/stat-giver-data-mixin/_types";

declare module "./mount-data.mjs" {
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
