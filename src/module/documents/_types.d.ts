import documentConfig from "../constants/config/document-config.mjs";

declare global {
  namespace Teriock.Documents {
    type DocumentConfig = typeof documentConfig;

    type ExtractKeysByDocName<T extends string> = {
      [K in keyof DocumentConfig]: DocumentConfig[K] extends { documentName: T } ? K : never;
    }[keyof DocumentConfig];

    export type ActorType = ExtractKeysByDocName<"Actor">;
    export type ItemType = ExtractKeysByDocName<"Item">;
    export type ActiveEffectType = ExtractKeysByDocName<"ActiveEffect">;
    export type CardType = ExtractKeysByDocName<"Card">;
    export type ChildType = Teriock.Documents.ActiveEffectType | Teriock.Documents.ItemType;
    export type CommonType = "base" | Teriock.Documents.ActorType | Teriock.Documents.ChildType;

    export type DocumentBase<Class, Parent extends object = object> = Class & Parent;

    export type Subtype<Base, Type extends string, Sheet, System> =
      & Omit<Base, "_id" | "id" | "sheet" | "system" | "type" | "uuid">
      & {
        _id: ID<Subtype<Base, Type, Sheet, System>>;
        sheet: Sheet;
        system: System;
        type: Type;
        get id(): ID<Subtype<Base, Type, Sheet, System>>;
        get uuid(): UUID<Subtype<Base, Type, Sheet, System>>;
      };

    export type ModelMetadata = {
      armament: boolean;
      childEffectTypes: Teriock.Documents.ActiveEffectType[];
      childItemTypes: Teriock.Documents.ItemType[];
      consumable: boolean;
      hierarchy: boolean;
      isTextPage?: boolean;
      passive: boolean;
      preservedProperties: string[];
      pseudos: Record<string, string>;
      revealable: boolean;
      stats: boolean;
      tooltip: boolean;
      type: Teriock.Documents.CommonType;
      usable: boolean;
      visibleTypes: Teriock.Documents.CommonType[];
      wiki: boolean;
    };

    export type DocumentMetadata = {
      child: boolean;
      common: boolean;
      hierarchy: boolean;
      model?: ModelMetadata;
      parent: boolean;
      tooltip: boolean;
    };
  }
}
