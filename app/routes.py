from flask import Blueprint, request, jsonify, render_template, current_app
import json
from .services.word_service import generate_words

main = Blueprint('main', __name__)

GAME_WORDS_FILE = "game_words.json"

# route to return the player.html template
@main.route('/')
def index():
    return render_template('player.html')

@main.route('/spymaster')
def spymaster():
    return render_template('spymaster.html')

# route to handle POST requests to generate/retrieve words
@main.route("/get_words", methods=["GET"])
def get_words():
    theme = request.args.get("theme", "Hinduism")  # Default theme if none provided
    use_ollama = current_app.config['USE_OLLAMA']  # Get the value from the configuration

    # Check if words were already generated
    try:
        with open(GAME_WORDS_FILE, "r") as file:
            data = json.load(file)
            saved_theme = '_'.join(theme.lower().strip().split())

            # TODO: retrieve words as long as part before parantheses is the same
            # TODO: use fuzzy matching logic (levenshtein distance or similar to match)
            # print(data[saved_theme])
            if saved_theme in data: 
                # Wrap the cached words in the expected structure
                return jsonify({"words": data[saved_theme]})
    except FileNotFoundError:
        pass
    except Exception as e:
        print(f"Error reading game words file: {e}")

    # Generate new words if none exist
    try:
        words = generate_words(theme, use_ollama=use_ollama)
        return jsonify({"theme": theme, "words": words})
    except Exception as e:
        print(f"Error generating words: {e}")
        return jsonify({"error": "Failed to generate words"}), 500