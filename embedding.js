const fs = require("fs");
require("dotenv").config();
const {recipes} = require("./config");

const model_id = "sentence-transformers/all-MiniLM-L6-v2";
const api_url = `https://api-inference.huggingface.co/pipeline/feature-extraction/${model_id}`;

async function query(text) {
    const options = {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.HUGGING_FACE_TOKEN}`
        },
        body: JSON.stringify
        ({inputs: text, options: {wait_for_model: true}}),
    };

    try {
        const response = await fetch(api_url, options);
        return response.json();
    } catch (error) {
        throw new Error(`Request failed: ${error}`);
    }
}

/**
 * run-func embedding getSingle "liquid meal with alcohol"
 */
module.exports.getSingle = async (text) => {
    const output = await query([text]);
    return output[0];
}

/**
 * run-func embedding all
 */
module.exports.all = async () => {
    //iterate over data and extract field
    const num_of_items = 100;
    const num_of_chunks = recipes.length / num_of_items;
    let embeddings = [];
    for (let i = 0; i < num_of_chunks; i++) {
        const recipesChunk = recipes.slice(i * num_of_items, (i + 1) * num_of_items);
        const directions = recipesChunk.map(value => value['directions'].join());

        // send request
        const newEmbeddings = await query(directions);
        embeddings = embeddings.concat(newEmbeddings);
    }
    //merge back
    const recipes_with_embeddings = recipes.map((value, index) => {
        value['embedding'] = embeddings[index];
        return value
    });

    fs.writeFile('recipes_with_embeddings.json', JSON.stringify(recipes_with_embeddings), 'utf8', err => {
        if (err) {
            console.error('Error writing to file:', err);
            return;
        }

        console.log('Saved recipes_with_embeddings.json');
    });
}