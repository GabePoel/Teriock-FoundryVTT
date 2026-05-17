import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import jsdoc from "eslint-plugin-jsdoc";
import perfectionist from "eslint-plugin-perfectionist";
import globals from "globals";
import tseslint from "typescript-eslint";

const globalDocuments = {
  ActiveEffect: "readonly",
  Actor: "readonly",
  ActorDelta: "readonly",
  Adventure: "readonly",
  AmbientLightDocument: "readonly",
  AmbientSoundDocument: "readonly",
  Card: "readonly",
  Cards: "readonly",
  ChatMessage: "readonly",
  Combat: "readonly",
  Combatant: "readonly",
  CombatantGroup: "readonly",
  DrawingDocument: "readonly",
  FogExploration: "readonly",
  Folder: "readonly",
  Item: "readonly",
  JournalEntry: "readonly",
  JournalEntryCategory: "readonly",
  JournalEntryPage: "readonly",
  Macro: "readonly",
  NoteDocument: "readonly",
  Playlist: "readonly",
  PlaylistSound: "readonly",
  RegionBehavior: "readonly",
  RegionDocument: "readonly",
  RollTable: "readonly",
  Scene: "readonly",
  Setting: "readonly",
  TableResult: "readonly",
  TileDocument: "readonly",
  TokenDocument: "readonly",
  User: "readonly",
  WallDocument: "readonly",
};

const globalHelpers = {
  Color: "readonly",
  Collection: "readonly",
  fromUuid: "readonly",
  fromUuidSync: "readonly",
  getDocumentClass: "readonly",
  Hooks: "readonly",
  ProseMirror: "readonly",
  Roll: "readonly",
  TextEditor: "readonly",
};

const globalClient = {
  CONFIG: "writable",
  CONST: "writable",
  Handlebars: "readonly",
  PIXI: "readonly",
  ProseMirror: "readonly",
  _del: "readonly",
  _replace: "readonly",
  _loc: "readonly",
  canvas: "readonly",
  foundry: "readonly",
  game: "readonly",
  getDocumentClass: "readonly",
  io: "readonly",
  ui: "readonly",
};

const globalMacro = {
  actor: "readonly",
  scope: "readonly",
};

const globalTeriock = {
  TERIOCK: "readonly",
  teriock: "readonly",
  tm: "readonly",
};

const globalModule = {
  TokenMagic: "readonly",
};

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{mjs,ts}"],
    plugins: {
      jsdoc,
      perfectionist,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globalDocuments,
        ...globalHelpers,
        ...globalClient,
        ...globalTeriock,
        ...globalModule,
      },
    },
    settings: {
      jsdoc: {
        preferredTypes: {
          ".<>": "<>",
          Object: "object",
          Function: "function",
        },
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      eqeqeq: ["error", "smart"],
      "no-console": "off",
      "no-empty": ["warn", { allowEmptyCatch: true }],
      "no-var": "error",
      "prefer-const": "warn",
      "jsdoc/check-types": "warn",
      "perfectionist/sort-array-includes": ["error", { type: "alphabetical", order: "asc" }],
      "perfectionist/sort-arrays": [
        "error",
        {
          type: "alphabetical",
          order: "asc",
          useConfigurationIf: { matchesAstSelector: "TSAsExpression > ArrayExpression" },
        },
      ],
      "perfectionist/sort-import-attributes": ["error", { type: "alphabetical", order: "asc" }],
      "perfectionist/sort-exports": ["error", { type: "alphabetical", order: "asc" }],
      "perfectionist/sort-union-types": [
        "error",
        {
          type: "alphabetical",
          order: "asc",
          groups: [
            "conditional",
            "function",
            "import",
            "intersection",
            "keyword",
            "literal",
            "named",
            "object",
            "operator",
            "tuple",
            "union",
            "nullish",
          ],
        },
      ],
      "perfectionist/sort-sets": ["error", { type: "alphabetical", order: "asc" }],

      "perfectionist/sort-imports": [
        "error",
        {
          type: "alphabetical",
          order: "asc",
          internalPattern: ["^~/.+", "^@/.+", "^#.+"],
          newlinesBetween: 1,
          groups: [
            "type-import",
            ["value-builtin", "value-external"],
            "type-internal",
            "value-internal",
            ["type-parent", "type-sibling", "type-index"],
            ["value-parent", "value-sibling", "value-index"],
            "ts-equals-import",
            "unknown",
          ],
        },
      ],
      "perfectionist/sort-classes": [
        "error",
        {
          type: "alphabetical",
          order: "asc",
          groups: [
            "index-signature",

            ["private-static-property", "private-static-accessor-property"],
            ["private-static-get-method", "private-static-set-method"],
            ["private-static-method", "private-static-function-property"],

            ["protected-static-property", "protected-static-accessor-property"],
            ["protected-static-get-method", "protected-static-set-method"],
            ["protected-static-method", "protected-static-function-property"],

            ["static-property", "static-accessor-property"],
            ["static-get-method", "static-set-method"],
            "static-block",
            ["static-method", "static-function-property"],

            "constructor",

            ["private-property", "private-accessor-property"],
            ["private-get-method", "private-set-method"],
            ["private-method", "private-function-property"],

            ["protected-property", "protected-accessor-property"],
            ["protected-get-method", "protected-set-method"],
            ["protected-method", "protected-function-property"],

            ["property", "accessor-property"],
            ["get-method", "set-method"],
            ["method", "function-property"],

            "unknown",
          ],
        },
      ],
    },
  },
  {
    files: ["src/macros/**/*.{js,mjs}"],
    languageOptions: { globals: { ...globalMacro } },
  },
  eslintConfigPrettier,

  {
    rules: {
      curly: ["warn", "all"],
    },
  },
);
