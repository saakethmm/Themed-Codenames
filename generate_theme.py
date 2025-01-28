import os
import torch
from flask import Flask, request, jsonify
from transformers import AutoModelForCausalLM, AutoTokenizer

app = Flask(__name__)

# Load the model once at startup
model_name = "gpt2"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

# Function to generate words based on a theme
@app.route("/get_words", methods=["POST"])
def get_words():
    data = request.json
    theme = data.get("theme", "default theme")
    
    # Generate words
    prompt = f"Generate a list of 25 unique words related to the theme '{theme}':\n"
    inputs = tokenizer(prompt, return_tensors="pt")
    outputs = model.generate(inputs.input_ids, max_length=100, temperature=0.7, do_sample=True)
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    
    # Process the words
    words = response.split("\n")[1:]  # Skip the prompt
    words = [word.strip() for word in words if word.strip()]

    print(words, len(words))

    return jsonify(words)

if __name__ == "__main__":
    # Run the Flask app
    app.run(debug=True)


