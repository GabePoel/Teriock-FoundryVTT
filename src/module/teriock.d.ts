// noinspection JSUnusedGlobalSymbols

import "./helpers/commands/_types";
import "./data/_types";
import "./applications/_types";
import "./documents/_types";
import { TypeCollection } from "./documents/collections/_module.mjs";
import { TeriockFolder } from "./documents/_module.mjs";
import PixiJS from "pixi.js";
import * as placeables from "./canvas/placeables/_module.mjs";

declare global {
  export import PIXI = PixiJS;

  const TERIOCK: typeof import("./constants/_module.mjs");
  // Collections
  // ===========

  const TypeCollection: TypeCollection;

  // Placeables
  // ==========

  const TeriockToken: placeables.TeriockToken;

  const __brand: unique symbol;

  /** FoundryVTT UUID */
  export type UUID<T = unknown> = string & {
    [__brand]: T;
  };

  // noinspection JSClassNamingConvention
  /** FoundryVTT ID */
  export type ID<T = unknown> = string & {
    [__brand]: T;
  };
  /** Safe Teriock UUID */
  export type SafeUUID<T = unknown> = string & {
    [__brand]: T;
  };

  /**
   * Index representing a subset of document data.
   */
  export type Index<Doc> = {
    _id: ID<Doc>;
    folder: ID<TeriockFolder>;
    img: string;
    name: string;
    pack: string;
    sort: number;
    type: Teriock.Documents.CommonType;
    uuid: UUID<Doc>;
    system: {
      _sup?: ID<Doc>;
    };
  };

  /**
   * A safe version of a document that can be called within compendiums.
   */
  export type SyncDoc<Doc> = Index<Doc> | Doc;

  // Utilities
  // =========

  type ArrayToSet<T> = {
    [K in keyof T]: T[K] extends (infer U)[] ? Set<U> : T[K];
  };

  type ArrayToSetFor<T, K extends keyof T> = Omit<T, K> & {
    [P in K]: T[P] extends (infer U)[] ? Set<U> : T[P];
  };
}

export {};
