const { client, indexName, recipes } = require("./config");
const { logBody } = require("./helpers");
const fs = require('fs');
const recipesWithEmbeddings = require("./recipes_with_embeddings.json");

/**
 * Getting list of indices
 * run-func index createIndexWithMapping
 */
module.exports.createIndexWithMapping = () => {
  client.indices.create({
    index: indexName,
    body: {
      settings: {
        index: {
          knn: true
        }
      },
      mappings: {
        properties: {
          embedding: {
            type: 'knn_vector',
            dimension: 384
          }
        }
      }
    }
  })
};

/**
 * Indexing data from json file with recipes.
 * Format: action \n document \n action \n document ...
 * run-func index indexData
 */
module.exports.indexData = () => {
  console.log(`Ingesting data: ${recipesWithEmbeddings.length} recipes`);
  const requestSize =8000;
  const numOfChunks = recipesWithEmbeddings.length / requestSize;
  for(let i = 0; i < numOfChunks; i++) {
    const chunk = recipesWithEmbeddings.slice(i * requestSize, (i + 1)*requestSize);
    console.log(chunk.length);
    const body = chunk.flatMap(recipe => [
      { index: { _index: indexName } },
      recipe,
    ]);

    client.bulk({ refresh: true, body }, logBody);
    console.log('Sent chunk #', i);
  }

};


/**
 * Getting list of indices
 * run-func index getIndices
 */
module.exports.getIndices = () => {
  console.log(`Getting existing indices:`);
  client.cat.indices({ format: "json" }, logBody);
};

/**
 * Retrieving mapping for the index.
 * run-func index getMapping
 */
module.exports.getMapping = () => {
  console.log(`Retrieving mapping for the index with name ${indexName}`);

  client.indices.getMapping({ index: indexName }, (error, result) => {
    if (error) {
      console.error(error);
    } else {
      console.log(result.body.recipes.mappings.properties);
    }
  });
};

