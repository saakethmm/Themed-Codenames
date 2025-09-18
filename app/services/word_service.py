import ollama 
import openai
import json
import re
import random


# 1. for myself: use ollama to generate words locally using model of choice (mistral-7b or llama3-8b) 
# 2. for users: use gpt4o-mini to generate words using my API key (charged to me for now); precompute a list of words for several themes 
# and shuffle them for each request to avoid generating the same words each time (if there's a hit, no need to query the API; otherwise,
# query the API and save the result for future requests)

# for either option, best would be to include a shuffle option to shuffle the existing words while generating a larger list so the user 
# doesn't keep generating

# Use OpenAI API for users (Replace with your actual API key)
openai.api_key = "your_openai_api_key" # TODO: replace with my actual API key

# File to store generated words for frontend use
GAME_WORDS_FILE = "game_words.json"

# Precomputed words database (load from a file)
# WORDS_DB_FILE = "precomputed_words.json"
# try:
#     with open(WORDS_DB_FILE, "r") as file:
#         WORDS_DB = json.load(file)
# except FileNotFoundError:
#     WORDS_DB = {}  # Initialize empty if file doesn't exist

# def save_precomputed_words():
#     """Save the updated word cache to the file."""
#     with open(WORDS_DB_FILE, "w") as file:
#         json.dump(WORDS_DB, file, indent=4)

def comma_separated_list_from_numbered(words_str: str):
    words = []
    for line in words_str.split('\n'):
        # Remove the numbering pattern (digits followed by a period and space)
        cleaned_line = re.sub(r'^\d+\.\s+', '', line)
        words.append(cleaned_line)

    # Convert array to comma-separated string
    return ", ".join(words)


def save_game_words(theme: str, words: list):
    """Save the generated words for the current game session."""
    try:
        with open(GAME_WORDS_FILE, "r") as file:
            game_words = json.load(file)
    except FileNotFoundError:
        game_words = {}

    theme = '_'.join(theme.lower().strip().split())
    if theme in game_words:
        game_words[theme].extend(words)
    else:
        game_words[theme] = words

    with open(GAME_WORDS_FILE, "w") as file:
        json.dump(game_words, file, indent=4)

def generate_words_local(theme):
    """Generate words using local Ollama (for personal use)."""
    prompt = f"Generate 40 different words/phrases on the theme: '{theme}' as a numbered list. No repeats. Don't include a header or footer:"
    response = ollama.chat(model="llama3.2:latest", messages=[{"role": "user", "content": prompt}])
    # Extract the words, removing only the list numbering pattern
    words_str = words = response["message"]["content"]
    words = comma_separated_list_from_numbered(words_str)

    save_game_words(theme, words)  # Save 40 words
    return words

# TODO! 
def generate_words_api(theme):
    """Generate words using OpenAI GPT-4o Mini API (for public users)."""
    if theme in WORDS_DB:
        words = random.sample(WORDS_DB[theme], 25)  # Shuffle precomputed list
    else:
        prompt = f"Generate 40 different words or phrases related to {theme} as a numbered list. No repeats. Don't include a header or footer:"
        response = openai.ChatCompletion.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        words_str = response["choices"][0]["message"]["content"]
        words = comma_separated_list_from_numbered(words_str)

        WORDS_DB[theme] = words
        save_precomputed_words()  # Cache for future use

    save_game_words(theme, words)  # Save to game JSON
    return words


def generate_words(theme, use_ollama=False):
    """Main function to generate words based on request type."""
    return generate_words_local(theme) if use_ollama else generate_words_api(theme)