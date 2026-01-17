import pandas as pd
import json
import os
import sys

def create_excel():
    if len(sys.argv) > 1:
        try:
            chapter_num = int(sys.argv[1])
        except ValueError:
            print("Invalid chapter number. Using default: 1")
            chapter_num = 1
    else:
        chapter_num = 1

    json_file = f'data/chapter_{chapter_num}.json'
    excel_file = f'data/Chapter_{chapter_num}.xlsx'
    
    if not os.path.exists(json_file):
        print(f"Error: {json_file} NOT found.")
        return

    try:
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        df = pd.DataFrame(data)
        
        # Select and reorder columns
        columns = ['chapter', 'verse', 'title', 'sanskrit', 'transliteration', 'word_meanings', 'translation', 'commentary']
        
        # Ensure all columns exist (in case some are missing in JSON)
        for col in columns:
            if col not in df.columns:
                df[col] = ""
                
        df = df[columns]
        
        # Rename columns for clarity
        df.columns = ['Chapter', 'Verse', 'Title', 'Sanskrit', 'Transliteration', 'Word Meanings', 'Translation', 'Commentary']
        
        df.to_excel(excel_file, index=False)
        print(f"Successfully created {excel_file}")
        
    except Exception as e:
        print(f"Error creating Excel: {e}")

if __name__ == "__main__":
    create_excel()
