from transformers import AutoModelForCausalLM, AutoTokenizer


# TODO: way forward
# 1. for myself: use ollama to generate words locally using model of choice (mistral-7b or llama3-8b) 
# 2. for users: use gpt4o-mini to generate words using my API key (charged to me for now); precompute a list of words for several themes 
# and shuffle them for each request to avoid generating the same words each time (if there's a hit, no need to query the API; otherwise,
# query the API and save the result for future requests)

# for either option, best would be to include a shuffle option to shuffle the existing words while generating a larger list so the user 
# doesn't keep generating

model_name = "gpt2"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

def generate_words(theme):
    prompt = f"Generate 25 unique words related to '{theme}':\n"
    inputs = tokenizer(prompt, return_tensors="pt")
    outputs = model.generate(inputs.input_ids, max_length=100, temperature=0.7, do_sample=True)
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    words = response.split("\n")[1:]  # Process the output
    return [word.strip() for word in words if word.strip()]