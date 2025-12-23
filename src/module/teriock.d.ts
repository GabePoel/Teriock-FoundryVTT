import "./data/_types";
import "./dice/_types";
import "./applications/_types";
import "./documents/_types";
import "./helpers/_types";
import { TeriockFolder } from "./documents/_module.mjs";
import PixiJS from "pixi.js";
import * as placeables from "./canvas/placeables/_module.mjs";

declare global {
  export import PIXI = PixiJS;

  const TERIOCK: typeof import("./constants/_module.mjs");

  const TeriockToken: placeables.TeriockToken;

  const __brand: unique symbol;

  /** FoundryVTT UUID */
  export type UUID<T = unknown> = string & {
    [__brand]: T;
  };

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

  type ArrayToSetFor<T, K extends keyof T> = Omit<T, K> & {
    [P in K]: T[P] extends (infer U)[] ? Set<U> : T[P];
  };
}
