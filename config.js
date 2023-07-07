require("dotenv").config();
const { Client } = require("@opensearch-project/opensearch");

// full_format_recipes.json taken from
// https://www.kaggle.com/hugodarwood/epirecipes?select=full_format_recipes.json
// cleaned with cleanData method from data.js
module.exports.recipes = require("./recipes_clean.json");

/**
 * Client performs requests on our behalf
 * Additionally, when creating a client you can also specify `ssl configuration`, `bearer token`, `CA fingerprint` and other authentication details depending on protocols you use.
 */
module.exports.client = new Client({
    node: process.env.SERVICE_URI,
});

module.exports.indexName = "recipes";

