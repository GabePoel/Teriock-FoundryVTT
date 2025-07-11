import type TypeDataModel from "@common/abstract/type-data.mjs";
import { MessageParts } from "../../types/messages";

export interface ChildDataMixin extends TypeDataModel {
  proficient: boolean;
  fluent: boolean;
  font: string;
  description: string;
  messageParts: MessageParts;
  secretMessageParts: MessageParts;

  use(options: object): void;
}
