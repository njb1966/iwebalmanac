module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/assets");

  eleventyConfig.addFilter("year", function(date) {
    return new Date(date).getFullYear();
  });

  eleventyConfig.addFilter("groupByYear", function(posts) {
    const groups = {};
    for (const post of posts) {
      const year = new Date(post.date).getFullYear();
      if (!groups[year]) groups[year] = [];
      groups[year].push(post);
    }
    return Object.keys(groups)
      .sort((a, b) => b - a)
      .map(year => ({ year, posts: groups[year] }));
  });

  eleventyConfig.addFilter("groupByYearRaw", function(items) {
    const groups = {};
    for (const item of items) {
      const year = new Date(item.date).getFullYear();
      if (!groups[year]) groups[year] = [];
      groups[year].push(item);
    }
    return Object.keys(groups)
      .sort((a, b) => b - a)
      .map(year => ({ year, items: groups[year] }));
  });

  eleventyConfig.addFilter("dateToFormat", function(date, format) {
    const d = new Date(date);
    if (format && format.startsWith("MMM")) {
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  });

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
