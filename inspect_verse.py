import requests
from bs4 import BeautifulSoup

url = "https://www.holy-bhagavad-gita.org/chapter/1/verse/1/en/"
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
}
response = requests.get(url, headers=headers)
with open('debug_page.html', 'w', encoding='utf-8') as f:
    f.write(response.text)

print(f"Status: {response.status_code}")
