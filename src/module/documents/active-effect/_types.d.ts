import { ActiveEffect } from "@client/documents/_module.mjs";

import { TeriockActiveEffect, TeriockActor, TeriockItem } from "../_module.mjs";
import { TeriockDocumentSheet } from "../../applications/api/_module.mjs";
import {
  AbilitySheet,
  ApplicableEffectSheet,
  AttunementSheet,
  ConditionSheet,
  ConsequenceSheet,
  FluencySheet,
  HackSheet,
  PropertySheet,
  ResourceSheet,
} from "../../applications/sheets/effect-sheets/_module.mjs";
import {
  AbilitySystem,
  AttunementSystem,
  BaseEffectSystem,
  ConditionSystem,
  ConsequenceSystem,
  FluencySystem,
  HackSystem,
  ImbuementSystem,
  PropertySystem,
  ResourceSystem,
} from "../../data/systems/effects/_module.mjs";

type ActiveEffectDocument = Teriock.Documents.DocumentBase<TeriockActiveEffect, ActiveEffect> & {
  parent: TeriockActor | TeriockItem;
};

declare global {
  export type TeriockAbility = Teriock.Documents.Subtype<ActiveEffectDocument, "ability", AbilitySheet, AbilitySystem>;
  export type TeriockAttunement = Teriock.Documents.Subtype<
    ActiveEffectDocument,
    "attunement",
    AttunementSheet,
    AttunementSystem
  >;
  export type TeriockCondition = Teriock.Documents.Subtype<
    ActiveEffectDocument,
    "condition",
    ConditionSheet,
    ConditionSystem
  >;
  export type TeriockConsequence = Teriock.Documents.Subtype<
    ActiveEffectDocument,
    "consequence",
    ConsequenceSheet,
    ConsequenceSystem
  >;
  export type TeriockCover = Teriock.Documents.Subtype<
    ActiveEffectDocument,
    "cover",
    TeriockDocumentSheet,
    BaseEffectSystem
  >;
  export type TeriockFluency = Teriock.Documents.Subtype<ActiveEffectDocument, "fluency", FluencySheet, FluencySystem>;
  export type TeriockHack = Teriock.Documents.Subtype<ActiveEffectDocument, "hack", HackSheet, HackSystem>;
  export type TeriockImbuement = Teriock.Documents.Subtype<
    ActiveEffectDocument,
    "imbuement",
    ApplicableEffectSheet,
    ImbuementSystem
  >;
  export type TeriockProperty = Teriock.Documents.Subtype<
    ActiveEffectDocument,
    "property",
    PropertySheet,
    PropertySystem
  >;
  export type TeriockResource = Teriock.Documents.Subtype<
    ActiveEffectDocument,
    "resource",
    ResourceSheet,
    ResourceSystem
  >;

  export interface ActiveEffectTypeMap {
    ability: TeriockAbility;
    attunement: TeriockAttunement;
    condition: TeriockCondition;
    consequence: TeriockConsequence;
    cover: TeriockCover;
    fluency: TeriockFluency;
    hack: TeriockHack;
    imbuement: TeriockImbuement;
    property: TeriockProperty;
    resource: TeriockResource;
  }
}

declare global {
  namespace Teriock.Documents {
    export interface ActiveEffectInterface {
      _id: ID<AnyActiveEffect>;
      parent: AnyParent;
      system: BaseEffectSystem;
      type: Teriock.Documents.ActiveEffectType;

      get actor(): AnyActor | null;

      get documentName(): "ActiveEffect";

      get id(): ID<AnyActiveEffect>;

      get uuid(): UUID<AnyActiveEffect>;
    }
  }
}

export {};
