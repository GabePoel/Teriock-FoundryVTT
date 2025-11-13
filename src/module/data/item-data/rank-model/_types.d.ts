import TeriockBaseItemModel from "../base-item-model/base-item-model.mjs";
import { TeriockRank } from "../../../documents/_documents.mjs";
import { WikiDataMixinInterface } from "../../mixins/wiki-data-mixin/_types";
import { StatGiverMixinInterface } from "../../mixins/stat-giver-data-mixin/_types";

declare module "./rank-model.mjs" {
  export default interface TeriockRankModel
    extends TeriockBaseItemModel,
      StatGiverMixinInterface,
      WikiDataMixinInterface {
    /** <schema> Rank Class Archetype */
    archetype: Teriock.Parameters.Rank.RankArchetype;
    /** <schema> Rank Class Name */
    className: Teriock.Parameters.Rank.RankClass;
    /** <schema> What number rank this is, with respect to its class */
    classRank: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
    /** <schema> Flaws */
    flaws: string;
    /** <schema> If this rank is innage */
    innate: boolean;
    /** <schema> Max Armor Value */
    maxAv: 0 | 1 | 2 | 3 | 4;

    get parent(): TeriockRank;
  }
}
