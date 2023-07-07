# Approximate KNN search with OpenSearch and JavaScript

This repository demonstrates how to use KNN with OpenSearch. It uses recipes data from Kaggle and Inferenece API from HuggingFace. 


Step by step how to run it

## Get the data set
You can use any dataset you want, preferably where you have text fields. I took [Epicurious - Recipes with Rating and Nutrition](https://www.kaggle.com/hugodarwood/epirecipes?select=full_format_recipes.json). This dataset has a set of recipes. One of the fields is `directions` which has long instructions for making the dish. I used that field for vector search.

Load full_format_recipes.json to the folder of the project and run `run-func data cleanData` to clean recipes that contain no info for `directions`(so that it is easier to merge embeddings with the recipe bodies later).

## Get embeddings

For vector search we'll need to get embeddings for our data for the following:
1. For the dataset (I selected to apply embeddings for `directions` field)
2. For the search query itself to transform search body into the vector

There are multiple options available (paid OpenAI API, local model, free/paid APIs from HuggingFace), I opted to use the inference API from hugging face. To do same, create account at https://huggingface.co/ and get a token. Add the tocken to the `.env` file of this project (use `.env.example` to create `.env`).

Free version of inference API isn't very fast and might return some errors if you're trying to submit a lot of data at once. I found that sending data by chunks is easier. You can try anywhere from 5K items to 100 items for it to work.

To get embeddings for `recipes_clean.json` run `run-func embedding all`. This will create `recipes_with_embeddings.json`.

## Set up OpenSearch

I used [Aiven for OpenSearch](https://aiven.io/opensearch), but you can use any other OpenSearch as it is fresh enough and supports KNN.
Add your OpenSearch URI to `.env`.

## Create an index

Normally, we can rely on dynamic index creation, however, we need to specify to OpenSearch that our index needs KNN and the field `embedding` is of type `knn_vector`. For the rest of the fields we can rely on the dynamic mapping.
Note, that you need also to specify the number of dimensions for the vectors. This depends on the model you use. In my case it was `384`.

```json
PUT recipes
{
  "settings": {
    "index": {
      "knn": true
    }
  },
  "mappings": {
    "properties": {
      "embedding": {
        "type": "knn_vector",
        "dimension": 384
      }
    }
  }
}
```







