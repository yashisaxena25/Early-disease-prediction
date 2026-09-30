import json
import joblib
import wikipedia
from pathlib import Path

# Load disease names from the trained model
BASE_DIR = Path(__file__).resolve().parent.parent
model = joblib.load(BASE_DIR / "models" / "disease_model.joblib")
diseases = model.classes_
# Load existing disease_info.json
with open(BASE_DIR / "data" / "disease_info.json", "r", encoding="utf-8") as file:    disease_info = json.load(file)

# Create case-insensitive lookup for existing disease names
disease_keys = {
    key.strip().lower(): key
    for key in disease_info.keys()
}

print(f"Found {len(diseases)} diseases.")

for i, disease in enumerate(diseases, start=1):

    print(f"[{i}/{len(diseases)}] Fetching: {disease}")
    json_key = disease_keys.get(disease.strip().lower())

    if not json_key:
      print("  No matching disease in disease_info.json.")
      continue

    if disease_info[json_key].get("description"):
      print("  Already has description - skipping.")
      continue

    
    # Find matching JSON key regardless of capitalization
    json_key = disease_keys.get(disease.strip().lower())

    if not json_key:
        print("  No matching disease in disease_info.json.")
        continue

    try:
        # Search Wikipedia
        search_results = wikipedia.search(disease)

        if not search_results:
            print("  No Wikipedia result found.")
            continue

        page_title = search_results[0]

        try:
            page = wikipedia.page(
                page_title,
                auto_suggest=False
            )
        except wikipedia.DisambiguationError as e:
            if not e.options:
                print("  Wikipedia disambiguation had no options.")
                continue

            page = wikipedia.page(
                e.options[0],
                auto_suggest=False
            )

        # Store Wikipedia summary
        disease_info[json_key]["description"] = page.summary

        print(f"  Updated: {json_key}")

    except Exception as e:
        print(f"  Could not fetch information: {e}")

# Save updated JSON
with open(BASE_DIR / "data" / "disease_info.json", "w", encoding="utf-8") as file:    json.dump(
        disease_info,
        file,
        indent=2,
        ensure_ascii=False
    )

print("\nDone!")
print("Updated disease_info.json")