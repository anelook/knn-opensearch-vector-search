const { client, indexName, recipes } = require("./config");
const { logBody } = require("./helpers");
const fs = require('fs');

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

