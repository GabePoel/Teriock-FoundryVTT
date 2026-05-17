import { ClientDocumentMixin } from "@client/documents/abstract/_module.mjs";
import { Document as FoundryDocument } from "@common/abstract/_module.mjs";

declare global {
  namespace Foundry {
    export type BarField = {
      max: number;
      min: number;
      value: number;
    };

    export class Document extends FoundryDocument {}

    type ClientDocument = (abstract new (
      data: object,
      options: object,
    ) => InstanceType<ReturnType<typeof ClientDocumentMixin>>) &
      typeof FoundryDocument;

    export type ContextMenuCallback = (target: HTMLElement) => unknown;

    export type ContextMenuOptions = {
      eventName?: string;
      fixed?: boolean;
      jQuery?: boolean;
      onClose?: ContextMenuCallback;
      onOpen?: ContextMenuCallback;
      forceDirection?: "up" | "down";
    };
  }
}

export {};
