const { client, indexName, recipes } = require("./config");
const { logBody } = require("./helpers");
const fs = require('fs');
const recipesWithEmbeddings = require("./recipes_with_embeddings.json");

/**
 * Indexing data from json file with recipes containing embeddings.
 * Format: action \n document \n action \n document ...
 * run-func index populate
 */
module.exports.populate = () => {
  console.log(`Ingesting data: ${recipes.length} recipes`);

  // Read the embeddings from the CSV file
  const embeddingsData = fs.readFileSync('embeddings.csv', 'utf8');
  const embeddings = embeddingsData.split('\n');

  // for (let i = 0; i < chunks; i++) {
    const recipes_cut = recipes.slice(0, 1001);
    console.log('embeddings.length', embeddings.length);
  console.log('recipes_cut.length', recipes_cut.length);
    // const batchEmbeddings = embeddings.slice(i * batchSize, (i + 1) * batchSize);

    const body = recipes_cut.flatMap((recipe, index) => [
      {index: {_index: indexName}},
      {
        ...recipe,
        embedding: embeddings[index].split(',').map(parseFloat).filter(value => !isNaN(value)),
      },
    ]);
    console.log(body.length)
     client.bulk({ refresh: true, body }, logBody);
  // }
};

/**
 * Indexing data from json file with recipes.
 * Format: action \n document \n action \n document ...
 * run-func index injectData
 */
module.exports.injectData = () => {
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

