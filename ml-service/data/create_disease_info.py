from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import joblib
import json

# Load the trained model
model = joblib.load("../models/disease_model.joblib")

# Get all disease names
diseases = model.classes_

# Create basic structure for every disease
disease_info = {}

for disease in diseases:
    disease_info[disease] = {
        "description": "",
        "symptoms": [],
        "causes": [],
        "risk_factors": [],
        "prevention": [],
        "specialist": "",
        "when_to_seek_help": ""
    }


# Load model and symptom list
model = joblib.load("models/disease_model.joblib")
symptom_columns = joblib.load("models/symptom_columns.joblib")

# Load disease information
with open("data/disease_info.json", "r", encoding="utf-8") as file:
    disease_info = json.load(file)