from flask import Blueprint, request, jsonify, render_template
from .services.word_service import generate_words

main = Blueprint('main', __name__)

@main.route('/')
def index():
    return render_template('player.html')

# @main.route('/get_words', methods=['POST'])
# def get_words():
#     theme = request.json.get('theme', 'default theme')
#     words = generate_words(theme)
#     return jsonify(words)