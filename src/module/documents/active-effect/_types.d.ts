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

type ActiveEffectDocument = Omit<Teriock.Documents.DocumentBase<TeriockActiveEffect, ActiveEffect>, "documentName"> & {
  parent: TeriockActor | TeriockItem;

  get documentName(): "ActiveEffect";
};

declare module "./active-effect.mjs" {
  export default interface TeriockActiveEffect {
    _id: ID<AnyActiveEffect>;
    system: BaseEffectSystem;
    type: Teriock.Documents.ActiveEffectType;

    get actor(): AnyActor | null;

    get documentName(): "ActiveEffect";

    get id(): ID<AnyActiveEffect>;

    get uuid(): UUID<AnyActiveEffect>;
  }
}

declare global {
  export interface TeriockAbility
    extends Teriock.Documents.Subtype<ActiveEffectDocument, "ability", AbilitySheet, AbilitySystem>
  {}
  export interface TeriockAttunement
    extends Teriock.Documents.Subtype<ActiveEffectDocument, "attunement", AttunementSheet, AttunementSystem>
  {}
  export interface TeriockCondition
    extends Teriock.Documents.Subtype<ActiveEffectDocument, "condition", ConditionSheet, ConditionSystem>
  {}
  export interface TeriockConsequence
    extends Teriock.Documents.Subtype<ActiveEffectDocument, "consequence", ConsequenceSheet, ConsequenceSystem>
  {}
  export interface TeriockCover
    extends Teriock.Documents.Subtype<ActiveEffectDocument, "cover", TeriockDocumentSheet, BaseEffectSystem>
  {}
  export interface TeriockFluency
    extends Teriock.Documents.Subtype<ActiveEffectDocument, "fluency", FluencySheet, FluencySystem>
  {}
  export interface TeriockHack extends Teriock.Documents.Subtype<ActiveEffectDocument, "hack", HackSheet, HackSystem> {}
  export interface TeriockImbuement
    extends Teriock.Documents.Subtype<ActiveEffectDocument, "imbuement", ApplicableEffectSheet, ImbuementSystem>
  {}
  export interface TeriockProperty
    extends Teriock.Documents.Subtype<ActiveEffectDocument, "property", PropertySheet, PropertySystem>
  {}
  export interface TeriockResource
    extends Teriock.Documents.Subtype<ActiveEffectDocument, "resource", ResourceSheet, ResourceSystem>
  {}

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

export {};
