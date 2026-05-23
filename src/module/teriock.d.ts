import "./data/_types";
import "./dice/_types";
import "./documents/_types";
import "./helpers/_types";
import { ForcedDeletion, ForcedReplacement } from "@common/data/operators.mjs";

import * as placeables from "./canvas/placeables/_module.mjs";
import { TeriockFolder } from "./documents/_module.mjs";

declare global {
  const TERIOCK: typeof import("./constants/_module.mjs");

  const TeriockToken: placeables.TeriockToken;

  const __brand: unique symbol;

  const _del: () => ForcedDeletion;
  const _loc: (stringId: string, data?: object) => string;
  const _replace: (value: never) => ForcedReplacement;

  /** Foundry VTT UUID */
  type UUID<T = unknown> = string & { [__brand]: T };

  /** Foundry VTT ID */
  type ID<T = unknown> = string & { [__brand]: T };

  /** A string that represents a document's identifier. */
  type Identifier = string;

  /** A string that represents a document's typed identifier. */
  type TypedIdentifier = string;

  /** Safe Teriock UUID */
  type SafeUUID<T = unknown> = string & { [__brand]: T };

  /** Index representing a subset of document data. */
  type Index<Doc> = {
    _id: ID<Doc>;
    folder: ID<TeriockFolder>;
    img: string;
    name: string;
    pack: string;
    sort: number;
    system: { _sup?: ID<Doc> };
    type: Teriock.Documents.CommonType;
    uuid: UUID<Doc>;
  };

  /** A safe version of a document that can be called within compendiums. */
  type SyncDoc<Doc> = Doc | Index<Doc>;
}
