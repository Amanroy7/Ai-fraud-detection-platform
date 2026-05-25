import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

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

# Test prediction
sample = ["Verify your account now"]

sample_vector = vectorizer.transform(sample)

prediction = model.predict(sample_vector)

print("Prediction:", prediction[0])