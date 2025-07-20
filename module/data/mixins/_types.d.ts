import { MessageParts } from "../../types/messages";

export interface ChildDataMixin {
  proficient: boolean;
  fluent: boolean;
  font: string;
  description: string;
  messageParts: MessageParts;
  secretMessageParts: MessageParts;

  use(options: object): void;
}
