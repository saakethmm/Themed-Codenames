from flask import Blueprint, request, jsonify, render_template, current_app
import json
from .services.word_service import generate_words

main = Blueprint('main', __name__)

GAME_WORDS_FILE = "game_words.json"

# route to return the player.html template
@main.route('/')
def index():
    return render_template('player.html')

# route to handle POST requests to generate/retrieve words
@main.route("/get_words", methods=["POST"])
def get_words():
    theme = request.json.get("theme", "Hinduism")  # Default theme if none provided
    use_ollama = current_app.config['USE_OLLAMA']  # Get the value from the configuration

    # Check if words were already generated
    try:
        with open(GAME_WORDS_FILE, "r") as file:
            data = json.load(file)
            if data["theme"] == theme:
                return jsonify(data)  # Serve cached words
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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)