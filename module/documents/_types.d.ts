import "./mixins/_types";
import { ActorData, ActiveEffectData, ItemData, TokenData } from "@common/documents/_types.mjs";
import Collection from "@common/utils/collection.mjs";
import { actor as actorModels, effect as effectModels, item as itemModels } from "../data/_module.mjs";
import type {
  TeriockActor as TeriockActorType,
  TeriockEffect as TeriockEffectType,
  TeriockItem as TeriockItemType,
  TeriockToken as TeriockTokenType,
} from "./_module.mjs";
import { PseudoApplication } from "../sheets/pseudo-sheets/_module.mjs";

type ActorModel = (typeof actorModels)[keyof typeof actorModels];
type EffectModel = (typeof effectModels)[keyof typeof effectModels];
type ItemModel = (typeof itemModels)[keyof typeof itemModels];

declare module "@client/documents/_module.mjs" {
  interface TeriockActor extends TeriockActorType, ActorData, ParentDocumentMixinInterface {
    type: ActorModel["metadata"]["type"];
    system: InstanceType<ActorModel>;
    items: Collection<string, TeriockItem>;
    effects: Collection<string, TeriockEffect>;
  }

  interface TeriockItem extends TeriockItemType, ItemData, ParentDocumentMixinInterface {
    type: ItemModel["metadata"]["type"];
    system: InstanceType<ItemModel>;
    effects: Collection<string, TeriockEffect>;
  }

  interface TeriockEffect extends TeriockEffectType, ActiveEffectData {
    type: EffectModel["metadata"]["type"];
    system: InstanceType<EffectModel>;
  }

  interface TeriockToken extends TeriockTokenType, TokenData {
    actor: TeriockActor;
  }
}

declare module "./actor.mjs" {
  const TeriockActor: TeriockActor;
  export default TeriockActor;
}

declare module "./item.mjs" {
  const TeriockItem: TeriockItem;
  export default TeriockItem;
}

declare module "./effect.mjs" {
  const TeriockEffect: TeriockEffect;
  export default TeriockEffect;
}

declare module "./token.mjs" {
  const TeriockToken: TeriockToken;
  export default TeriockToken;
}

declare module "./pseudo.mjs" {
  export default interface Pseudo {
    _id: string;
  }
}

export type PseudoMetadata = {
  /* The document name of this pseudo-document. */
  documentName: string,
  /** The localization string for this pseudo-document */
  label: string;
  /** The font-awesome icon for this pseudo-document type */
  icon: string;
  /* Record of document names of pseudo-documents and the path to the collection. */
  embedded: Record<string, string>,
  /* The class used to render this pseudo-document. */
  sheetClass?: PseudoApplication,
};
