# imports
import ast  # for converting embeddings saved as strings back to arrays
import openai  # for calling the OpenAI API
import pandas as pd  # for storing text and embeddings data
import tiktoken  # for counting tokens
from scipy import spatial  # for calculating vector similarities for search
from dotenv import load_dotenv
import pickle
import os
import sklearn
import sys


def askEmbed(question, context):
    EMBEDDING_MODEL = "text-embedding-ada-002"
    GPT_MODEL = "gpt-4"
    DATA_PATH = "./instructions.txt"
    load_dotenv()
    print("Loading data...")
    if not os.path.exists(DATA_PATH):
        print("File does not exist")
        sys.exit()

    openai.api_key = os.getenv("OPENAI_API_KEY")
    from openai.embeddings_utils import (
        get_embedding,
        distances_from_embeddings,
        tsne_components_from_embeddings,
        chart_from_components,
        indices_of_nearest_neighbors_from_distances,
    )

    with open(DATA_PATH, 'r') as file:
        data = file.read().split('---')
    data = [s.strip() for s in data if s.strip()]

    df = pd.DataFrame(data, columns=['Action'])
    embedding_cache_path = "./solana_embed.pkl"
    try:
        embedding_cache = pd.read_pickle(embedding_cache_path)
    except FileNotFoundError:
        embedding_cache = {}

    with open(embedding_cache_path, "wb") as embedding_cache_file:
        pickle.dump(embedding_cache, embedding_cache_file)

    def embedding_from_string(string: str, model: str = EMBEDDING_MODEL, embedding_cache=embedding_cache) -> list:
        if (string, model) not in embedding_cache.keys():
            embedding_cache[(string, model)] = get_embedding(string, model)
            with open(embedding_cache_path, "wb") as embedding_cache_file:
                pickle.dump(embedding_cache, embedding_cache_file)
        return embedding_cache[(string, model)]

    def strings_ranked_by_relatedness(query: str, df: pd.DataFrame, relatedness_fn=lambda x, y: 1 - spatial.distance.cosine(x, y), top_n: int = 3) -> tuple[list[str], list[float]]:
        query_embedding_response = openai.Embedding.create(model=EMBEDDING_MODEL, input=query)
        query_embedding = query_embedding_response["data"][0]["embedding"]
        counter = 0
        r = []
        strings_and_relatednesses = []

        for idx, row in df.iterrows():
            counter += 1
            str = f'"Action": {row["Action"]}'
            embedding = embedding_from_string(str)
            strings_and_relatednesses.append((str, relatedness_fn(query_embedding, embedding)))
        print("How many items?: ", len(strings_and_relatednesses))
        strings_and_relatednesses.sort(key=lambda x: x[1], reverse=True)
        strings, relatednesses = zip(*strings_and_relatednesses)
        r = strings[:top_n], relatednesses[:top_n]
        return r

    def num_tokens(text: str, model: str = GPT_MODEL) -> int:
        encoding = tiktoken.encoding_for_model(model)
        return len(encoding.encode(text))

    def query_message(query: str, df: pd.DataFrame, model: str, token_budget: int) -> str:
        strings, relatednesses = strings_ranked_by_relatedness(query, df)
        ## if array of relatedness has values less than 0.9 then return  a text to ask more information to understand the request
        if (relatednesses[0] < 0.9):
            introduction = 'These are the actions that relate the most to the users question or request:\n"""\n'
            question = f"\n\nUser's: {query}"

        message = introduction
        for string in strings:
            next_article = f'\n\n:\n"""\n{string}\n"""'
            if (
                num_tokens(message + next_article + question, model=model)
                > token_budget
            ):
                break
            else:
                message += next_article
        return message + question

    def ask(
        query: str,
        context: str,
        df: pd.DataFrame = df,
        model: str = GPT_MODEL,
        token_budget: int = 4096,
        print_message: bool = False,
    ):
        message = query_message(query, df, model=model, token_budget=token_budget)
        messages = [
            {"role": "system", "content": context},  # Set the conversation context
            {"role": "assistant", "content": 'You are a helpful assistant capable of understanding Solana blockchain transactions requests. You can interpret requests for sending SOL tokens, checking balances, create accounts, and requesting payments. If you cannot detect the user request, ask for more information. Return just the answer to the user, wether is just the action detected as a JSON or just text'},  # Set the assistant's role
            {"role": "user", "content": query},  # Pass the user's message
            {"role": "assistant", "content":  message}, 
            {"role": "assistant", "content": "" } # Pass the user's message
        ]


        print("\n")
        print("Messages: ", messages)
        response = openai.ChatCompletion.create(
            model=model,
            messages=messages,
            temperature=0,
            max_tokens=token_budget,  # Ensure the response won't exceed the token limit
        )
        result = response["choices"][0]["message"]["content"]
        return result

    prompt = question
    context = context
    print(f"User: {prompt}")
    outputd = ask(query = prompt, context = context, print_message=True)
    print(f"Decaf AI: {outputd}")
    return (outputd, )
