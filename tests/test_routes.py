import unittest
from generate_theme import app

class FlaskTestCase(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_get_words(self):
        response = self.app.post('/get_words', json={"theme": "Hindu mythology"})
        self.assertEqual(response.status_code, 200)
        words = response.get_json()
        self.assertTrue(len(words) == 25)

if __name__ == "__main__":
    unittest.main()