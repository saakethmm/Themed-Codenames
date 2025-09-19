"""
word_service.py

Provides functions for generating themed word lists for the Codenames game using local Ollama LLM or (future) API, and for saving generated words to a JSON file.
"""

import ollama 
import openai
import json
import re
import random


openai.api_key = "your_openai_api_key" # TODO: replace with my API key

# File to store generated words for frontend use
GAME_WORDS_FILE = "game_words.json"

def comma_separated_list_from_numbered(words_str: str):
    """
    Converts a numbered list of words (as a string) into a comma-separated string, removing the numbering.
    """
    words = []
    for line in words_str.split('\n'):
        # Remove the numbering pattern (digits followed by a period and space)
        cleaned_line = re.sub(r'^\d+\.\s+', '', line)
        words.append(cleaned_line)

    # Convert array to comma-separated string
    return ", ".join(words)


def save_game_words(theme: str, words: list):
    """
    Saves the generated words for a given theme into the game_words.json file, appending if the theme already exists.
    """
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
    """
    Uses the local Ollama model (llama3.2:latest) to generate 40 words related to the given theme, saves them, and returns them as a comma-separated string.
    """
    prompt = f"Generate 40 different words on the theme: '{theme}' as a numbered list. No repeats. Don't include a header or footer:"
    response = ollama.chat(model="llama3.2:latest", messages=[{"role": "user", "content": prompt}])
    # Extract the words, removing only the list numbering pattern
    words_str = words = response["message"]["content"]
    words = comma_separated_list_from_numbered(words_str)

    save_game_words(theme, words)  # Save 40 words
    return words

# TODO: will be fixed in later update 
def generate_words_api(theme):
    """
    Placeholder for future API-based word generation (currently not implemented).
    """
    pass


def generate_words(theme, use_ollama=False):
    """
    Main function to generate words; uses Ollama if use_ollama is True, otherwise will use the API function (currently not implemented).
    """
    return generate_words_local(theme) if use_ollama else generate_words_api(theme)