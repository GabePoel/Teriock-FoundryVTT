exports.defineTags = function (dictionary) {
  dictionary.defineTag("derived", {
    mustHaveValue: false,
    onTagged: function (doclet) {
      doclet.derived = true;
    },
  });
  dictionary.defineTag("base", {
    mustHaveValue: false,
    onTagged: function (doclet) {
      doclet.base = true;
    },
  });
};
