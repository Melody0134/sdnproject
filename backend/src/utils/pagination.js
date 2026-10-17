const parsePagination = (query, defaults = { page: 1, limit: 20, maxLimit: 100 }) => {
  const page = Math.max(1, Number(query.page) || defaults.page);
  const limit = Math.min(defaults.maxLimit, Math.max(1, Number(query.limit) || defaults.limit));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const buildPageResult = (data, total, page, limit) => ({
  data,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  },
});

module.exports = { parsePagination, buildPageResult };
