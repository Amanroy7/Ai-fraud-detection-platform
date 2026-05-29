from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
from urllib.parse import urlparse
from bs4 import BeautifulSoup
import pandas as pd
import joblib
from sqlalchemy import create_engine, text
# =========================
# SQLITE DATABASE
# =========================

DATABASE_URL = "sqlite:///scam_detection.db"

engine = create_engine(DATABASE_URL)
# =========================
# CREATE TABLE
# =========================

with engine.connect() as conn:

    conn.execute(text("""

    CREATE TABLE IF NOT EXISTS scans (

        id INTEGER PRIMARY KEY AUTOINCREMENT,

        url TEXT,

        prediction TEXT,

        confidence TEXT,

        risk_level TEXT

    )

    """))

    conn.commit()

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# =========================
# TRAIN MODEL
# =========================

# data = pd.read_csv("../Dataset/scam_dataset.csv")

# X = data["text"]
# y = data["label"]

# vectorizer = TfidfVectorizer()

# X_vectorized = vectorizer.fit_transform(X)

# model = LogisticRegression()

# model.fit(X_vectorized, y)

model = joblib.load("scam_model.pkl")
vectorizer = joblib.load("vectorizer.pkl")



joblib.dump(model, "scam_model.pkl")
joblib.dump(vectorizer, "vectorizer.pkl")

# =========================
# FASTAPI APP
# =========================

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# HOME ROUTE
# =========================

@app.get("/")
def home():

    return {
        "message": "AI Scam Detection API Running"
    }

# =========================
# SCAN WEBSITE
# =========================

@app.get("/scan")
def scan_website(url: str):

    # =========================
    # URL VALIDATION
    # =========================

    parsed_url = urlparse(url)

    if not parsed_url.scheme or not parsed_url.netloc:

        return {
            "url": url,
            "prediction": "invalid",
            "confidence": "0%",
            "risk_level": "High"
        }

    # =========================
    # OPEN WEBSITE
    # =========================

    response = requests.get(url)

    # =========================
    # EXTRACT WEBSITE TEXT
    # =========================

    soup = BeautifulSoup(response.text, "html.parser")

    website_text = soup.get_text()

    # Limit text size
    website_text = website_text[:1000]

    # =========================
    # MACHINE LEARNING PREDICTION
    # =========================

    website_vector = vectorizer.transform([website_text])

    prediction = model.predict(website_vector)

    probability = model.predict_proba(website_vector)

    safe_probability = probability[0][1] * 100

    # =========================
    # URL ANALYSIS
    # =========================

    suspicious_keywords = [
        "login",
        "verify",
        "bank",
        "secure",
        "update",
        "free",
        "reward",
    ]

    url_risk = 0

    for keyword in suspicious_keywords:

        if keyword in url.lower():
            url_risk += 1

    if ".xyz" in url:
        url_risk += 2

    if "-" in url:
        url_risk += 1

    # =========================
    # FINAL SCORE
    # =========================

    safe_probability = safe_probability - (url_risk * 10)

    if safe_probability < 0:
        safe_probability = 0

    # =========================
    # RISK LEVEL
    # =========================

    if safe_probability > 70:
        risk_level = "Low"

    elif safe_probability > 40:
        risk_level = "Medium"

    else:
        risk_level = "High"

    # =========================
    # SAVE TO DATABASE
    # =========================

    with engine.connect() as conn:

        conn.execute(text("""

        INSERT INTO scans (
            url,
            prediction,
            confidence,
            risk_level
        )

        VALUES (
            :url,
            :prediction,
            :confidence,
            :risk_level
        )

        """),

        {
            "url": url,
            "prediction": prediction[0],
            "confidence": f"{safe_probability:.2f}%",
            "risk_level": risk_level
        })

        conn.commit()

    # =========================
    # RETURN RESPONSE
    # =========================

    return {
        "url": url,
        "prediction": prediction[0],
        "confidence": f"{safe_probability:.2f}%",
        "risk_level": risk_level
    }
    # =========================
# GET SCAN HISTORY
# =========================

@app.get("/history")
def get_history():

    with engine.connect() as conn:

        result = conn.execute(text("""

        SELECT * FROM scans
        ORDER BY id DESC

        """))

        scans = []

        for row in result:

            scans.append({
                "id": row[0],
                "url": row[1],
                "prediction": row[2],
                "confidence": row[3],
                "risk_level": row[4]
            })

    return scans

@app.get("/scan_sms")
def scan_sms(message: str):

    sms_vector = vectorizer.transform([message])

    prediction = model.predict(sms_vector)

    probability = model.predict_proba(sms_vector)

    confidence = max(probability[0]) * 100

    if confidence > 80:
        risk_level = "Low"
    elif confidence > 50:
        risk_level = "Medium"
    else:
        risk_level = "High"

    return {
        "message": message,
        "prediction": prediction[0],
        "confidence": f"{confidence:.2f}%",
        "risk_level": risk_level
    }