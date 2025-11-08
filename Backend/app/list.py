import google.generativeai as genai
import os

# Configure your Gemini API key
# Set this as an environment variable: export GEMINI_API_KEY='your-api-key'
GEMINI_API_KEY = ('AIzaSyD_jmzPNKfQzEF5HApkeT4ztRV3Tgj7Bvc')

if not GEMINI_API_KEY:
    print("Error: GEMINI_API_KEY environment variable not set!")
    print("Set it with: export GEMINI_API_KEY='your-api-key'")
    exit(1)

genai.configure(api_key=GEMINI_API_KEY)

print("\n" + "="*80)
print("AVAILABLE GEMINI MODELS")
print("="*80 + "\n")

try:
    model_count = 0
    for model in genai.list_models():
        model_count += 1
        print(f"Model #{model_count}")
        print("-" * 80)
        print(f"Name:                  {model.name}")
        print(f"Display Name:          {model.display_name}")
        print(f"Description:           {model.description}")
        print(f"Input Token Limit:     {model.input_token_limit:,}")
        print(f"Output Token Limit:    {model.output_token_limit:,}")
        print(f"Supported Methods:     {', '.join(model.supported_generation_methods)}")
        print("=" * 80 + "\n")
    
    print(f"Total Models Found: {model_count}\n")
    
except Exception as e:
    print(f"Error fetching models: {str(e)}")
    exit(1)