# Bhagavad Gita Verse Extractor

This project allows you to extract verses from the Bhagavad Gita (from [holy-bhagavad-gita.org](https://www.holy-bhagavad-gita.org)) and save them in structured formats (JSON, Excel, CSV).

## Features

*   **Extract Verses**: Scrapes verses, translations, and commentaries.
*   **Multi-Format Output**: Saves data to JSON, Text, Excel, and CSV files.
*   **Organized Storage**: All output files are automatically saved in a `data/` directory.

## Setup

### 1. Clone the Repository
```bash
git clone <repository_url>
cd <repository_folder>
```

### 2. Create a Virtual Environment (Optional but Recommended)
It is good practice to run python projects in a virtual environment to avoid conflicts.
```bash
# Windows
python -m venv venv
.\venv\Scripts\Activate.ps1

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
Install the required packages using pip:
```bash
pip install -r requirements.txt
```

## Usage

### Extracting a Chapter
Run the extraction script followed by the chapter number you want to extract.
```bash
python extract_citations.py <chapter_number>
```
*Example:* `python extract_citations.py 2`
*   This will create `data/chapter_2.json` and `data/chapter_2.txt`.

### Creating Excel and CSV Files
Once the data is extracted (JSON file exists), you can generate Excel and CSV files.
```bash
python create_excel.py <chapter_number>
python create_csv.py <chapter_number>
```
*Example:* 
`python create_excel.py 2` -> Creates `data/Chapter_2.xlsx`
`python create_csv.py 2` -> Creates `data/Chapter_2.csv`

## Output
All generated files are stored in the `data/` directory.
