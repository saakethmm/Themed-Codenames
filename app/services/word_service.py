from transformers import AutoModelForCausalLM, AutoTokenizer
import ollama 
import openai
import json


# 1. for myself: use ollama to generate words locally using model of choice (mistral-7b or llama3-8b) 
# 2. for users: use gpt4o-mini to generate words using my API key (charged to me for now); precompute a list of words for several themes 
# and shuffle them for each request to avoid generating the same words each time (if there's a hit, no need to query the API; otherwise,
# query the API and save the result for future requests)

# for either option, best would be to include a shuffle option to shuffle the existing words while generating a larger list so the user 
# doesn't keep generating

# Use OpenAI API for users (Replace with your actual API key)
openai.api_key = "your_openai_api_key" # TODO: replace with your actual API key

# Precomputed words database (load from a file)
WORDS_DB_FILE = "precomputed_words.json"
try:
    with open(WORDS_DB_FILE, "r") as file:
        WORDS_DB = json.load(file)
except FileNotFoundError:
    WORDS_DB = {}  # Initialize empty if file doesn't exist

def save_precomputed_words():
    """Save the updated word cache to the file."""
    with open(WORDS_DB_FILE, "w") as file:
        json.dump(WORDS_DB, file, indent=4)

def generate_words_local(theme):
    """Generate words using local Ollama (for personal use)."""
    prompt = f"Generate 40 unique words related to '{theme}':"
    response = ollama.chat(model="llama3", messages=[{"role": "user", "content": prompt}])
    return response["message"]["content"].split("\n")

def generate_words_api(theme):
    """Generate words using OpenAI GPT-4o Mini API (for public users)."""
    # Check precomputed words first
    if theme in WORDS_DB:
        return random.sample(WORDS_DB[theme], 25)  # Shuffle precomputed list

    # If not found, query GPT-4o Mini
    prompt = f"Generate 40 unique words related to '{theme}':"
    response = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )
    
    words = response["choices"][0]["message"]["content"].split("\n")
    words = [word.strip() for word in words if word.strip()]
    
    # Cache the result for future requests
    WORDS_DB[theme] = words
    save_precomputed_words()
    
    return words

def generate_words(theme, use_ollama=False):
    """Main function to generate words based on request type."""
    return generate_words_local(theme) if use_ollama else generate_words_api(theme)