import type { HTMLEnrichedContentElement } from "@client/applications/elements/_module.mjs";
import type { EnrichmentOptions } from "@client/applications/ux/text-editor.mjs";

declare global {
  namespace Teriock.Enrichment {
    export type Input = { arguments: string[], config: Record<string, boolean | number | string | null> };
    export type Parsed = Input & { alias: string, label?: string };
    export type Process = (inputs: Parsed, options: EnrichmentOptions) => Promise<HTMLElement | null>;

    export type Format = {
      aliases: string[];
      hasConfig: boolean;
      hasMultipleArguments: boolean;
      type: "display" | "link" | "roll";
    };

    export type EnricherConfig = {
      format: Format;
      id?: string;
      process: Process;
      replaceParent?: boolean;
      onRender?: (el: HTMLEnrichedContentElement) => Promise<void>;
    };
  }
}

export {};
