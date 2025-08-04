import { MessageParts } from "../../types/messages";

export interface ChildDataMixin {
  proficient: boolean;
  fluent: boolean;
  font: Teriock.Font;
  description: string;
  messageParts: MessageParts;
  secretMessageParts: MessageParts;

  use(options: object): void;
}
