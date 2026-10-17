const Taxonomy = require('../models/taxonomy.model');
const Club = require('../models/club.model');
const ClubRegistration = require('../models/club-registration.model');
const AppError = require('../utils/app-error');
const { parsePagination, buildPageResult } = require('../utils/pagination');

const listTaxonomies = async (query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = {};
  if (query.type) filter.type = query.type;
  if (query.isActive !== undefined) filter.isActive = query.isActive;
  if (query.search) filter.$text = { $search: query.search };
  const [items, total] = await Promise.all([
    Taxonomy.find(filter)
      .select('-normalizedName')
      .sort({ type: 1, name: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Taxonomy.countDocuments(filter),
  ]);
  return buildPageResult(items, total, page, limit);
};

const createTaxonomy = async (payload) => Taxonomy.create(payload);

const updateTaxonomy = async (taxonomyId, updates) => {
  const taxonomy = await Taxonomy.findById(taxonomyId);
  if (!taxonomy) throw new AppError('Không tìm thấy dữ liệu phân loại', 404);
  Object.assign(taxonomy, updates);
  await taxonomy.save();
  return taxonomy;
};

const deleteTaxonomy = async (taxonomyId) => {
  const taxonomy = await Taxonomy.findById(taxonomyId).select('_id type').lean();
  if (!taxonomy) throw new AppError('Không tìm thấy dữ liệu phân loại', 404);
  if (taxonomy.type === 'category') {
    const isUsed = await Promise.all([
      Club.exists({ category: taxonomyId }),
      ClubRegistration.exists({ category: taxonomyId }),
    ]);
    if (isUsed.some(Boolean)) throw new AppError('Không thể xóa danh mục đang được câu lạc bộ sử dụng', 409);
  }
  await Taxonomy.deleteOne({ _id: taxonomyId });
};

module.exports = { listTaxonomies, createTaxonomy, updateTaxonomy, deleteTaxonomy };
