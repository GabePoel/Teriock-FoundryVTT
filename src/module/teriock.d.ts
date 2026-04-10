import "./data/_types";
import "./dice/_types";
import "./documents/_types";
import "./helpers/_types";
import { TeriockFolder } from "./documents/_module.mjs";
import PixiJS from "pixi.js";
import * as placeables from "./canvas/placeables/_module.mjs";

declare global {
  const PIXI: typeof PixiJS;

  const TERIOCK: typeof import("./constants/_module.mjs");

  const TeriockToken: placeables.TeriockToken;

  const __brand: unique symbol;

  /** FoundryVTT UUID */
  type UUID<T = unknown> = string & {
    [__brand]: T;
  };

  /** FoundryVTT ID */
  type ID<T = unknown> = string & {
    [__brand]: T;
  };

  /**
   * A string that represents a document's identifier.
   */
  type Identifier = string;

  /**
   * A string that represents a document's typed identifier.
   */
  type TypedIdentifier = string;

  /** Safe Teriock UUID */
  type SafeUUID<T = unknown> = string & {
    [__brand]: T;
  };

  /**
   * Index representing a subset of document data.
   */
  type Index<Doc> = {
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
  type SyncDoc<Doc> = Index<Doc> | Doc;
}
