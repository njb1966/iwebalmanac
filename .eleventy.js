module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/assets");

  eleventyConfig.addCollection("essays", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/essays/*.md")
      .sort((a, b) => b.date - a.date);
  });
  eleventyConfig.addCollection("discoveries", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/discoveries/*.md")
      .sort((a, b) => b.date - a.date);
  });
  eleventyConfig.addCollection("notes", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/notes/*.md")
      .sort((a, b) => b.date - a.date);
  });
  eleventyConfig.addCollection("protocols", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/protocols/*.md")
      .sort((a, b) => b.date - a.date);
  });
  eleventyConfig.addCollection("infrastructure", function(collectionApi) {
    return collectionApi.getFilteredByGlob("src/infrastructure/*.md")
      .sort((a, b) => b.date - a.date);
  });

  return {
    dir: {
      input: "src",
      output: "dist",
      includes: "_includes",
      data: "_data"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"]
  };
};
