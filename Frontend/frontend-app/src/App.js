import { useState } from "react";

function App() {

  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  const [sms, setSms] = useState("");
  const [smsResult, setSmsResult] = useState(null);

  // =========================
  // ANALYTICS
  // =========================

  const totalScans = history.length;

  const highRisk = history.filter(
    (item) => item.risk_level === "High"
  ).length;

  const mediumRisk = history.filter(
    (item) => item.risk_level === "Medium"
  ).length;

  const lowRisk = history.filter(
    (item) => item.risk_level === "Low"
  ).length;

  // =========================
  // WEBSITE SCAN
  // =========================

  const scanWebsite = async () => {

    try {

      setError("");

      setLoading(true);

      await new Promise(resolve => setTimeout(resolve, 2000));

      const response = await fetch(
        `https://ai-fraud-backend.onrender.com/scan?url=${url}`
      );

      const data = await response.json();

      setResult(data);

      setHistory((prev) => [data, ...prev]);

    } catch (err) {

      setError("Invalid Website URL or Server Error");

    } finally {

      setLoading(false);
    }
  };

  // =========================
  // SMS SCAN
  // =========================

  const scanSMS = async () => {

    try {

      setLoading(true);

      const response = await fetch(
        `https://ai-fraud-backend.onrender.com/scan_sms?message=${sms}`
      );

      const data = await response.json();

      setSmsResult(data);

    } catch (err) {

      setError("SMS Scan Failed");

    } finally {

      setLoading(false);
    }
  };

  return (

    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#0f172a",
        color: "white",
        paddingTop: "50px",
        paddingBottom: "50px",
      }}
    >

      {/* DASHBOARD */}

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "30px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >

        <div
          style={{
            backgroundColor: "#1e293b",
            padding: "20px",
            borderRadius: "12px",
            width: "180px",
            textAlign: "center",
          }}
        >
          <h3>Total Scans</h3>
          <h1>{totalScans}</h1>
        </div>

        <div
          style={{
            backgroundColor: "#7f1d1d",
            padding: "20px",
            borderRadius: "12px",
            width: "180px",
            textAlign: "center",
          }}
        >
          <h3>High Risk</h3>
          <h1>{highRisk}</h1>
        </div>

        <div
          style={{
            backgroundColor: "#854d0e",
            padding: "20px",
            borderRadius: "12px",
            width: "180px",
            textAlign: "center",
          }}
        >
          <h3>Medium Risk</h3>
          <h1>{mediumRisk}</h1>
        </div>

        <div
          style={{
            backgroundColor: "#166534",
            padding: "20px",
            borderRadius: "12px",
            width: "180px",
            textAlign: "center",
          }}
        >
          <h3>Safe Websites</h3>
          <h1>{lowRisk}</h1>
        </div>

      </div>

      <h1
  style={{
    fontSize: "42px",
    marginBottom: "10px",
    textAlign: "center",
  }}
>
  AI Fraud Detection Platform
</h1>

<p
  style={{
    color: "#cbd5e1",
    maxWidth: "700px",
    textAlign: "center",
    lineHeight: "28px",
    marginBottom: "30px",
  }}
>
  Advanced AI-powered cybersecurity platform for detecting
  scam websites, phishing URLs, OTP fraud messages,
  and suspicious online activities using Machine Learning,
  NLP, and real-time risk analysis.
</p>

      <input
        type="text"
        placeholder="Enter Website URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        style={{
          padding: "12px",
          width: "320px",
          marginTop: "20px",
          borderRadius: "8px",
          border: "none",
        }}
      />

      <button
        onClick={scanWebsite}
        style={{
          marginTop: "20px",
          padding: "12px 20px",
          borderRadius: "8px",
          border: "none",
          backgroundColor: "#2563eb",
          color: "white",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Scan Website
      </button>

      {
        loading && (
          <p style={{ marginTop: "20px" }}>
            Scanning Website...
          </p>
        )
      }

      {
        error && (
          <p style={{ marginTop: "20px", color: "red" }}>
            {error}
          </p>
        )
      }

      {
        result && (

          <div
            style={{
              marginTop: "30px",
              backgroundColor: "#1e293b",
              padding: "20px",
              borderRadius: "10px",
              width: "320px",
            }}
          >

            <h2>Scan Result</h2>

            <p>
              <strong>Prediction:</strong> {result.prediction}
            </p>

            <p>
              <strong>Confidence:</strong> {result.confidence}
            </p>

            <p>
              <strong>Risk Level:</strong>{" "}

              <span
                style={{
                  color:
                    result.risk_level === "Low"
                      ? "lightgreen"
                      : result.risk_level === "Medium"
                      ? "yellow"
                      : "red",
                }}
              >
                {result.risk_level}
              </span>

            </p>

          </div>
        )
      }

      {
        history.length > 0 && (

          <div
            style={{
              marginTop: "30px",
              width: "320px",
            }}
          >

            <h2>Scan History</h2>

            {
              history.map((item, index) => (

                <div
                  key={index}
                  style={{
                    backgroundColor: "#1e293b",
                    padding: "15px",
                    borderRadius: "10px",
                    marginTop: "10px",
                  }}
                >

                  <p>
                    <strong>URL:</strong> {item.url}
                  </p>

                  <p>
                    <strong>Prediction:</strong> {item.prediction}
                  </p>

                  <p>
                    <strong>Risk:</strong>{" "}

                    <span
                      style={{
                        color:
                          item.risk_level === "Low"
                            ? "lightgreen"
                            : item.risk_level === "Medium"
                            ? "yellow"
                            : "red",
                      }}
                    >
                      {item.risk_level}
                    </span>

                  </p>

                </div>
              ))
            }

          </div>
        )
      }

      {/* SMS DETECTOR */}

      <div
        style={{
          marginTop: "40px",
          backgroundColor: "#1e293b",
          padding: "20px",
          borderRadius: "10px",
          width: "320px",
        }}
      >

        <h2>SMS Scam Detector</h2>

        <textarea
          placeholder="Paste SMS or OTP message"
          value={sms}
          onChange={(e) => setSms(e.target.value)}
          style={{
            width: "100%",
            height: "100px",
            marginTop: "10px",
            padding: "10px",
            borderRadius: "8px",
            border: "none",
          }}
        />

        <button
          onClick={scanSMS}
          style={{
            marginTop: "15px",
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#dc2626",
            color: "white",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Scan SMS
        </button>

        {
          smsResult && (

            <div
              style={{
                marginTop: "20px",
              }}
            >

              <p>
                <strong>Prediction:</strong> {smsResult.prediction}
              </p>

              <p>
                <strong>Confidence:</strong> {smsResult.confidence}
              </p>

              <p>
                <strong>Risk Level:</strong>{" "}

                <span
                  style={{
                    color:
                      smsResult.risk_level === "Low"
                        ? "lightgreen"
                        : smsResult.risk_level === "Medium"
                        ? "yellow"
                        : "red",
                  }}
                >
                  {smsResult.risk_level}
                </span>

              </p>

            </div>
          )
        }

      </div>

    </div>
  );
}

export default App;