export const targets = {
  ancestors: "Ancestor Documents",
  all: "All Documents",
};

export const time = {
  base: {
    hint:
      "Base changes are the first ones applied. They take effect right after base data for documents have been" +
      " set up and before any derived values have been determined.",
    label: "Base Changes",
  },
  proficiency: {
    hint:
      "Proficiency changes apply immediately after base ones. This should be used exclusively for effects that" +
      " make other documents proficient.",
    label: "Proficiency Changes",
  },
  fluency: {
    hint:
      "Fluency changes apply immediately after proficiency ones. This should be used exclusively for effects" +
      " that make other documents fluent.",
    label: "Fluency Changes",
  },
  normal: {
    hint:
      "Normal changes are the last ones applied before derived values are determined. This is the default time" +
      " that changes are applied and should be used unless there is a specific reason to apply at some other time.",
  },
  derivation: {
    hint:
      "Derivation changes apply once derived data has been calculated. This should only be used for effects" +
      " where the changes themselves rely on data that's been derived.",
    label: "Derivation Changes",
  },
  final: {
    hint:
      "These are the last changes that are applied. There is very minimal document data prep that occurs after" +
      " these changes, so they should only be used for instances where nothing passively relies on them.",
    label: "Final Changes",
  },
};

export const timeLabels = Object.fromEntries(
  Object.entries(time).map(([k, v]) => [k, v.label]),
);
