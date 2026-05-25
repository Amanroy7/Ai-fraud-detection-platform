import requests
from bs4 import BeautifulSoup

# Website URL
url = "https://example.com"

# Get website data
response = requests.get(url)

# Convert HTML into readable format
soup = BeautifulSoup(response.text, "html.parser")

# Extract visible text
text = soup.get_text()

# Print first 1000 characters
print(text[:1000])