import { AffinityFactory } from "./abstract/_module.mjs";

/** Affinities for every affinity type in the config. */
export default Object.fromEntries(Object.keys(TERIOCK.CONFIG.affinity.types).map((k) => [k, AffinityFactory(k)]));
