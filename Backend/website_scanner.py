import requests
from bs4 import BeautifulSoup
import pandas as pd

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# =========================
# TRAINING PART
# =========================

# Load dataset
data = pd.read_csv("../Dataset/scam_dataset.csv")

# Input and output
X = data["text"]
y = data["label"]

# Convert text into numbers
vectorizer = TfidfVectorizer()

X_vectorized = vectorizer.fit_transform(X)

# Train model
model = LogisticRegression()

model.fit(X_vectorized, y)

print("Model trained successfully!")

# =========================
# WEBSITE SCANNING PART
# =========================

# Website URL
url = "https://google.com"

# Open website
response = requests.get(url)

# Extract website text
soup = BeautifulSoup(response.text, "html.parser")

website_text = soup.get_text()

# Clean text
website_text = website_text[:1000]

# Convert into numbers
website_vector = vectorizer.transform([website_text])

# Predict
prediction = model.predict(website_vector)

print("\nWebsite Prediction:", prediction[0])