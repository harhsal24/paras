import requests
from bs4 import BeautifulSoup
import json
import time
import sys
import os

def extract_verses():
    if len(sys.argv) > 1:
        try:
            chapter_num = int(sys.argv[1])
        except ValueError:
            print("Invalid chapter number. Using default: 1")
            chapter_num = 1
    else:
        chapter_num = 1

    base_url = f"https://www.holy-bhagavad-gita.org/chapter/{chapter_num}/verse/{{}}/en/"
    verses = []
    verse_num = 1
    
    print(f"Starting extraction for Chapter {chapter_num}...")
    
    while True:
        url = base_url.format(verse_num)
        print(f"Fetching {url}")
        
        try:
            response = requests.get(url, timeout=10)
            
            # Check for redirect to next chapter (or 404 if simple)
            # The site might redirect /chapter/1/verse/48 -> /chapter/2...
            if response.status_code != 200:
                print(f"Stopped at verse {verse_num}: Status {response.status_code}")
                break
                
            # Check for redirect to next chapter
            next_chapter_url_part = f"/chapter/{chapter_num + 1}/"
            if next_chapter_url_part in response.url:
                print(f"Redirected to Chapter {chapter_num + 1} at verse {verse_num}. Stopping.")
                break

            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Title extraction
            # Based on previous observation: "Bhagavad Gita: Chapter 1, Verse 1"
            title_tag = soup.find('h1')
            title = title_tag.get_text(strip=True) if title_tag else f"Verse {verse_num}"
            
            # Extract content sections
            # The structure observed was Header -> Translation -> Commentary
            # We want the Verse text (Sanskrit) which usually is before Translation
            
            # Let's try to find the container div if possible, or iterate
            # Common pattern in such sites:
            # <div id="verse-text"> ... </div>
            # <div id="translation"> ... </div>
            
            # Since I don't have exact IDs, I'll grab text by looking for headers
            
            verse_data = {
                "chapter": 1,
                "verse": verse_num,
                "title": title,
                "sanskrit": "",
                "translation": "",
                "commentary": ""
            }
            
            # Extract Sanskrit
            sanskrit_div = soup.find('div', class_='bg-shlocks')
            if sanskrit_div:
                verse_data['sanskrit'] = sanskrit_div.get_text(separator='\n', strip=True)

            # Extract Transliteration
            transliteration_div = soup.find('div', class_='bg-transliteration')
            if transliteration_div:
                verse_data['transliteration'] = transliteration_div.get_text(separator='\n', strip=True)

            # Extract Word Meanings
            word_meanings_div = soup.find('div', class_='bg-verse-words')
            if word_meanings_div:
                verse_data['word_meanings'] = word_meanings_div.get_text(separator=' ', strip=True)

            # Extract Translation
            translation_div = soup.find('div', class_='bg-verse-translation')
            if translation_div:
                verse_data['translation'] = translation_div.get_text(strip=True)

            # Extract Commentary
            commentary_div = soup.find('div', class_='bg-verse-commentary')
            if commentary_div:
                verse_data['commentary'] = commentary_div.get_text(separator='\n', strip=True)
            
            verses.append(verse_data)
            print(f"Extracted Verse {verse_num}")
            
            verse_num += 1
            time.sleep(0.5)
            
        except Exception as e:
            print(f"Error extracting verse {verse_num}: {e}")
            break

    # Ensure data directory exists
    if not os.path.exists('data'):
        os.makedirs('data')

    json_filename = f'data/chapter_{chapter_num}.json'
    txt_filename = f'data/chapter_{chapter_num}.txt'

    with open(json_filename, 'w', encoding='utf-8') as f:
        json.dump(verses, f, indent=2, ensure_ascii=False)
        
    with open(txt_filename, 'w', encoding='utf-8') as f:
        for v in verses:
            f.write(f"{v['title']}\n")
            f.write("-" * 20 + "\n")
            f.write(f"Sanskrit:\n{v['sanskrit']}\n\n")
            f.write(f"Transliteration:\n{v['transliteration']}\n\n")
            f.write(f"Word Meanings:\n{v['word_meanings']}\n\n")
            f.write(f"Translation:\n{v['translation']}\n")
            f.write("=" * 40 + "\n\n")

    print(f"Finished. Extracted {len(verses)} verses.")

if __name__ == "__main__":
    extract_verses()
