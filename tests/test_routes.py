import unittest
import json
import os
from app import create_app

class FlaskTestCase(unittest.TestCase):
    def setUp(self):
        # Use the development configuration for testing
        self.app = create_app('config.DevelopmentConfig').test_client()
        self.app.testing = True

    def test_get_words(self):
        # Define the theme to test
        theme = "Hindu mythology"
        
        # Make a POST request to the /get_words route
        response = self.app.post('/get_words', json={"theme": theme})
        
        # Print the response content for debugging
        print(response.data.decode())

        # Check if the response status code is 200 (OK)
        self.assertEqual(response.status_code, 200)
        
        # Parse the JSON response
        data = response.get_json()
        
        # Check if the theme and words are in the response
        self.assertIn("theme", data)
        self.assertIn("words", data)
        self.assertEqual(data["theme"], theme)
        self.assertTrue(len(data["words"]) > 0)
        
        # Check if the words are saved in the game_words.json file
        with open("game_words.json", "r") as file:
            saved_data = json.load(file)
            self.assertEqual(saved_data["theme"], theme)
            self.assertEqual(saved_data["words"], data["words"])

    def test_generate_words_local(self):
        # Define the theme to test
        theme = "Hindu mythology"
        
        # Call the generate_words function with use_ollama=True
        from app.services.word_service import generate_words
        words = generate_words(theme, use_ollama=True)
        
        # Check if the words are saved in the game_words.json file
        with open("game_words.json", "r") as file:
            saved_data = json.load(file)
            self.assertEqual(saved_data["theme"], theme)
            self.assertEqual(saved_data["words"], words)

    # def test_generate_words_api(self):
    #     # Define the theme to test
    #     theme = "Hindu mythology"
        
    #     # Call the generate_words function with use_ollama=False
    #     from app.services.word_service import generate_words
    #     words = generate_words(theme, use_ollama=False)
        
    #     # Check if the words are saved in the game_words.json file
    #     with open("game_words.json", "r") as file:
    #         saved_data = json.load(file)
    #         self.assertEqual(saved_data["theme"], theme)
    #         self.assertEqual(saved_data["words"], words)

if __name__ == "__main__":
    unittest.main()