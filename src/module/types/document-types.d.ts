export type ActorType = "character";

export type ItemType = "base" | "equipment" | "rank" | "power" | "mechanic";

export type EffectType =
  | "ability"
  | "attunement"
  | "base"
  | "condition"
  | "consequence"
  | "fluency"
  | "property"
  | "resource";

export type DataModelMetadata = {
  type: string;
};

export type ChildDataModelMetadata = DataModelMetadata & {
  usable: boolean;
  consumable: boolean;
  wiki: boolean;
  namespace: string;
  pageNameKey: string;
};

export type ActorDataModelMetadata = DataModelMetadata & {
  type: Teriock.ActorType;
};

export type ItemDataModelMetadata = ChildDataModelMetadata & {
  type: Teriock.ItemType;
};

export type EffectDataModelMetadata = ChildDataModelMetadata & {
  type: Teriock.EffectType;
  hierarchy: boolean;
};
