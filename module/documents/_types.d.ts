import "./mixins/_types";
import { ActiveEffectData, ActorData, ItemData, TokenData } from "@common/documents/_types.mjs";
import Collection from "@common/utils/collection.mjs";
import { actor as actorModels, effect as effectModels, item as itemModels } from "../data/_module.mjs";
import type { TeriockActor, TeriockEffect, TeriockItem } from "./_module.mjs";
import {
  TeriockAbility,
  TeriockCondition,
  TeriockEquipment,
  TeriockFluency,
  TeriockPower,
  TeriockProperty,
  TeriockRank,
  TeriockResource,
} from "../types/documents";

type ActorModel = (typeof actorModels)[keyof typeof actorModels];
type EffectModel = (typeof effectModels)[keyof typeof effectModels];
type ItemModel = (typeof itemModels)[keyof typeof itemModels];

interface ParentDocumentMixinInterface {
  /** Each {@link TeriockEffect} this contains. */
  validEffects: TeriockEffect[];
  /** The names of each {@link TeriockItem} this contains, in camel case, keyed by type. */
  itemKeys: {
    equipment?: Set<string>;
    power?: Set<string>;
    rank?: Set<string>;
  };
  /** Each {@link TeriockItem} this contains, keyed by type. */
  itemTypes: {
    equipment?: TeriockEquipment[];
    power?: TeriockPower[];
    rank?: TeriockRank[];
  };
  /** The names of each {@link TeriockEffect} this contains, in camel case, keyed by type. */
  effectKeys: {
    ability?: Set<string>;
    attunement?: Set<string>;
    base?: Set<string>;
    condition?: Set<string>;
    effect?: Set<string>;
    fluency?: Set<string>;
    property?: Set<string>;
    resource?: Set<string>;
  };
  /** Each {@link TeriockEffect} this contains, keyed by type. */
  effectTypes: {
    ability?: TeriockAbility[];
    attunement?: TeriockAttunement[];
    base?: TeriockEffect[];
    condition?: TeriockCondition[];
    effect?: TeriockEffect[];
    fluency?: TeriockFluency[];
    property?: TeriockProperty[];
    resource?: TeriockResource[];
  };
}

declare module "@client/documents/_module.mjs" {
  interface Actor<Model extends ActorModel = ActorModel> extends ActorData {
    type: Model["metadata"]["type"];
    system: InstanceType<Model>;
    items: Collection<string, TeriockItem>;
    effects: Collection<string, TeriockEffect>;
  }

  interface Item<Model extends ItemModel = ItemModel> extends ItemData {
    type: Model["metadata"]["type"];
    system: InstanceType<Model>;
    effects: Collection<string, TeriockEffect>;
    parent: TeriockActor;
  }

  interface ActiveEffect<Model extends EffectModel = EffectModel> extends ActiveEffectData {
    type: Model["metadata"]["type"];
    system: InstanceType<Model>;
  }

  interface Token extends TokenData {
    actor: TeriockActor;
  }
}
