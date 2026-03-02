if (["mov", "str"].includes(scope.attribute)) {
  await scope.effect?.delete();
}
