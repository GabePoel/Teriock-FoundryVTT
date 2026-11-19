import { preLocalizeObject } from "../../helpers/localization.mjs";

const elderSorceryConfig = {
  partsOfSpeech: {
    adjective: "TERIOCK.TERMS.PartsOfSpeech.adjective",
    adverb: "TERIOCK.TERMS.PartsOfSpeech.adverb",
    article: "TERIOCK.TERMS.PartsOfSpeech.article",
    conjunction: "TERIOCK.TERMS.PartsOfSpeech.conjunction",
    noun: "TERIOCK.TERMS.PartsOfSpeech.noun",
    preposition: "TERIOCK.TERMS.PartsOfSpeech.preposition",
    pronoun: "TERIOCK.TERMS.PartsOfSpeech.pronoun",
    verb: "TERIOCK.TERMS.PartsOfSpeech.verb",
  },
};

export default elderSorceryConfig;

preLocalizeObject("CONFIG.elderSorcery.partsOfSpeech");
