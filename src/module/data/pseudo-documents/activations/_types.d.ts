import commandConfig from "../../../static/config/command-config.mjs";
import {
  AddDocumentsActivation,
  ChangeMovementActivation,
  ChangeQuantityActivation,
  MacroActivation,
  RegionActivation,
  RepositionActivation,
  RollActivation,
  SummonActivation,
  TakeActivation,
  UseDocumentsActivation,
} from "./_module.mjs";
import { BaseActivation } from "./abstract/_module.mjs";

type CommandActivationKey = {
  [K in keyof typeof commandConfig]: (typeof commandConfig)[K] extends { numeric: object } ? never
    : K;
}[keyof typeof commandConfig];

type CommandActivationTypeMap = Record<CommandActivationKey, BaseActivation>;

declare global {
  export interface ActivationTypeMap extends CommandActivationTypeMap {
    addDocuments: AddDocumentsActivation;
    changeMovement: ChangeMovementActivation;
    changeQuantity: ChangeQuantityActivation;
    macro: MacroActivation;
    move: RepositionActivation;
    region: RegionActivation;
    roll: RollActivation;
    summon: SummonActivation;
    take: TakeActivation;
    useDocuments: UseDocumentsActivation;
  }

  export type ActivationType = TypeMapKey<ActivationTypeMap>;
  export type Activation<T extends ActivationType = ActivationType> = ActivationTypeMap[T] & BaseActivation;
}

export {};
