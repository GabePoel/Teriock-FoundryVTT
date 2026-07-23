import changeConfig from "../constants/config/change-config.mjs";
import settingsConfig from "../constants/config/settings-config.mjs";
import tipConfig from "../constants/config/tip-config.mjs";
import { BasePreviewModel } from "../data/models/preview-models/_module.mjs";
import { TeriockActor } from "../documents/_module.mjs";

declare global {
  namespace Teriock.Config {
    export type SettingsConfig = typeof settingsConfig;

    export type SettingsCategory = keyof SettingsConfig["categories"];

    export type SettingsKey<Category extends SettingsCategory = SettingsCategory> =
      & keyof SettingsConfig["categories"][Category]
      & string;

    /** Settings categories composed into each document category's settings model. */
    export interface SettingsCompositionMap {
      ability: "ability" | "consumable";
      actor: "actor";
      armament: "armament";
      consumable: "consumable";
      equipment: "armament" | "consumable" | "equipment";
    }

    export type DocumentSettingsCategory = keyof SettingsCompositionMap;

    /** Union of the setting keys from every group composed into a document settings category. */
    export type ComposedSettingsKey<Category extends DocumentSettingsCategory = DocumentSettingsCategory> =
      SettingsCompositionMap[Category] extends infer Group extends SettingsCategory
        ? Group extends SettingsCategory ? SettingsKey<Group> : never
        : never;

    // Tip Keys
    export type SuppressionMessageKey = keyof typeof tipConfig.suppression;
    export type ErrorMessageKey = keyof typeof tipConfig.error;

    export type ChildChangeTargetEntry = {
      label: string;
      /** The child document subtypes that this applies to. */
      types: Teriock.Documents.ChildType[];
    };

    export type ChildChangePathEntry = {
      forExecution?: boolean;
      group: keyof typeof changeConfig.child.groups;
      label: string;
      targets: (keyof typeof changeConfig.child.targets)[];
      types?: Teriock.Changes.Type[];
    };

    export type CurrencyEntry = { conversion: number, label: string, weight: number };

    export type StatEntry = {
      abbreviation: string;
      bar?: { class: string, initial: number, lockInputs?: boolean, max?: number, min?: number, temp?: boolean };
      color?: { base: string, dark: string, darkest: string, light: string };
      /** DSN flavor key */
      die?: string;
      hacks?: boolean;
      icon: string;
      impact: Teriock.Keys.Impact;
      label: string;
      morganti?: boolean;
      multiplier: number;
      /** Stat pool configuration */
      pool?: { enabled: boolean, img: string, panel: { name: string, text: string } };
      /** DSN appearance options */
      style?: { colorset: string };
      transformationReset?: { initial: boolean, update: Record<string, unknown> };
    };

    export type WikiNamespaceEntry = {
      collection?: string;
      icon: string;
      identifierType?: string;
      index?: string;
      packs: string[];
      parentKey: string;
      type: string;
    };

    export type DocumentEntry = {
      documentName: "Card" | "JournalEntryPage" | CommonDocumentName;
      getter: string;
      hint: string;
      icon: string;
      index: string;
      label: string;
      pack: string;
      plural: string;
      previewModel?: typeof BasePreviewModel;
      importDialog?: () => Promise<TeriockDocument | void>;
      sorter: (doc: AnyCommonDocument[]) => AnyCommonDocument[];
    };

    export type ImpactEntry = {
      aliases?: string[];
      deal: string;
      icon: string;
      label: string;
      morganti?: boolean;
      nullable?: boolean;
      take: string;
      apply: (actor: TeriockActor, amt: number) => Promise<void>;
      reverse: (actor: TeriockActor, amt: number, options: object) => Promise<void>;
    };

    export type HackEntry = {
      icon: string;
      label: string;
      max: number;
      part: string;
      remove: string;
      statuses: string[];
    };

    export type SizeEntry = {
      /** ID for this size category */
      category: string;
      /** Number of tiles wide this size category is on the battlefield */
      length: number;
      /** Maximum size corresponding to this category */
      max: number;
      /** Number of feet this size category can reach for mêlée attacks */
      reach: number;
    };

    export type TargetEntry = { label: string, targetsActor?: boolean, targetsArmament?: boolean };

    export type DeliveryEntry = {
      allowPiercing?: boolean;
      aoe?: boolean;
      contact?: boolean;
      label: string;
      needsItem?: boolean;
      ranged?: boolean;
      sizes?: string;
      template?: string;
    };

    export type ExpansionEntry = DeliveryEntry & { needsSaveAttribute?: boolean };

    export type SubtypeEntry = { color?: string, icon: string, label: string };
  }
}

export {};
