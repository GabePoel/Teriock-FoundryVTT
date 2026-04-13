import { massUpdate } from "../utils.mjs";

/**
 * Query that updates many documents.
 * @param {Teriock.QueryData.MassUpdate} queryData
 * @param {{_timeout?: number}} timeout
 * @returns {Promise<void>}
 */
export default async function massUpdateQuery(queryData, { _timeout }) {
  await massUpdate(
    queryData.documentName,
    queryData.updateData,
    queryData.operation,
  );
}
