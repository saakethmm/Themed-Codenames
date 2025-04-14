from flask import Blueprint, request, jsonify, render_template, current_app
import json
from .services.word_service import generate_words
from fuzzywuzzy import fuzz

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

            best_match = None
            best_score = 0
            for existing_theme in data.keys():
                score = fuzz.ratio(saved_theme, existing_theme)
                if score > best_score:
                    best_score = score
                    best_match = existing_theme

            if best_score >= 85 and best_match:
                return jsonify({"words": data[best_match]})
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