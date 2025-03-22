# Themed Codenames

Ever wanted to play Codenames but with any arbitrary theme? This tool helps you do exactly that.

## Features

- Enter a custom theme to generate words related to that theme.
- Play as a player or a spymaster with the same set of words.
- Uses local or API-based word generation.

## Setup (for local)

1. **Clone the repository:**

   ```sh
   git clone <repository-url>
   cd hindu_codenames

2. Install dependencies using `conda`

```sh
conda env create -f environment.yaml
conda activate themed-codenames
```

3. Set up environment variables

```sh
export FLASK_ENV=development
export OPENAI_API_KEY=your_openai_api_key
```

4. Run Flask Application

```python
python run.py
```

## Configuration

- `config.py`: Contains configuration classes for development and production environments.

- `DevelopmentConfig`: Use Ollama for local word generation.

- `ProductionConfig`: Use OpenAI API for word generation.

## Usage

1. Access Application

- Player: http://127.0.0.1:5000/
- Spymaster: http://127.0.0.1:5000/spymaster

2. Enter a theme in the input field and click "Submit" to generate words related to that theme.

## File Structure

- **app/**: Contains the Flask application.
  - **templates/**: HTML templates.
    - `player.html`: Player view.
    - `spymaster.html`: Spymaster view.
  - **static/**: Static files (CSS, JS).
    - **css/**: Stylesheets.
      - `style.css`: Main stylesheet.
    - **js/**: JavaScript files.
      - `player.js`: Player logic.
      - `spymaster.js`: Spymaster logic.
      - `hinduwords.js`: Default words.
  - **services/**: Service files.
    - `word_service.py`: Word generation logic.
  - `routes.py`: Flask routes.
  - `__init__.py`: Flask app factory.
- **tests/**: Unit tests.
  - `test_routes.py`: Tests for routes.
- `config.py`: Configuration classes.
- `run.py`: Entry point to run the Flask application.
- `game_words.json`: Stores generated words for the current game session.

## Testing

Run the unit tests using:

```python
python -m unittest discover tests
```

## License (TODO)