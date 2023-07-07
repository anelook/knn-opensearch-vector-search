const fs = require("fs");
require("dotenv").config();
const { recipes } = require("./config");

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
    console.log(output[0])
    return output[0];
}

/**
 * run-func embedding embed
 */
module.exports.embed = async () => {
    //iterate over data and extract field
    const num_of_items = 300;
    const num_of_chunks = recipes.length / num_of_items;
    let embeddings = [];
    for (let i = 0; i < num_of_chunks; i++) {
        const valuesToProcess = recipes.slice(i * num_of_items, (i+ 1) * num_of_items).map(value => value['directions'].join());
        console.log('valuesToProcess', valuesToProcess.length);

        // send request
        const newEmbeddings = await query(valuesToProcess);
        embeddings = embeddings.concat(newEmbeddings);
        console.log('embeddings', embeddings.length);
    }
    //merge back
    const recipes_with_embeddings = recipes.map((value, index) => {value['directions'] = embeddings[index]; return value});
    console.log('recipes', recipes.length);
    console.log('recipes_with_embeddings', recipes_with_embeddings.length);
    console.log('recipes_with_embeddings', recipes_with_embeddings[0]);

    fs.writeFile('recipes_with_embeddings.json', recipes_with_embeddings, 'utf8', err => {
        if (err) {
            console.error('Error writing to file:', err);
            return;
        }

        console.log('Filtered data saved to recipes_clean.json');
    });


}