const KnowledgeChunk = require("../models/KnowledgeChunk");
const { cosineSimilarity } = require("./geminiEmbeddings");

const TOP_K = 5;
const VECTOR_SEARCH_INDEX = process.env.VECTOR_SEARCH_INDEX;

const atlasVectorSearch = async (queryEmbedding, role) => {
  const results = await KnowledgeChunk.aggregate([
    {
      $vectorSearch: {
        index: VECTOR_SEARCH_INDEX,
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: 100,
        limit: TOP_K,
        filter: { roles: role },
      },
    },
    {
      $project: {
        sourceFile: 1,
        page: 1,
        text: 1,
        score: { $meta: "vectorSearchScore" },
      },
    },
  ]);

  return results;
};

const bruteForceSearch = async (queryEmbedding, role) => {
  const chunks = await KnowledgeChunk.find({ roles: role }).lean();

  return chunks
    .map((chunk) => ({ ...chunk, score: cosineSimilarity(queryEmbedding, chunk.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, TOP_K);
};

const searchKnowledgeChunks = async (queryEmbedding, role) => {
  if (VECTOR_SEARCH_INDEX) {
    return atlasVectorSearch(queryEmbedding, role);
  }
  return bruteForceSearch(queryEmbedding, role);
};

module.exports = { searchKnowledgeChunks };