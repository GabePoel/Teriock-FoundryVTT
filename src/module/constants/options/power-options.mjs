import { colors } from "../display/colors.mjs";

/**
 * @type {Record<string, {name: string; icon: string; color:
 *   Teriock.Parameters.Shared.Color}>}
 */
export const powerOptions = {
  backstory: {
    name: "Backstory",
    icon: "book-open-cover",
    color: colors.green,
  },
  blessing: {
    name: "Blessing",
    icon: "sun-bright",
    color: colors.yellow,
  },
  curse: {
    name: "Curse",
    icon: "hand-holding-skull",
    color: colors.red,
  },
  familiar: {
    name: "Familiar",
    icon: "monkey",
    color: colors.green,
  },
  innate: {
    name: "Innate",
    icon: "person",
    color: colors.purple,
  },
  learned: {
    name: "Learned",
    icon: "head-side-brain",
    color: colors.brown,
  },
  pact: {
    name: "Pact",
    icon: "signature",
    color: colors.grey,
  },
  traits: {
    name: "Traits",
    icon: "ghost",
    color: colors.green,
  },
  other: {
    name: "Other",
    icon: "question",
    color: colors.green,
  },
};
