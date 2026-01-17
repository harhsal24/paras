import pandas as pd
import os

csv_file = 'Chapter_1.csv'

if os.path.exists(csv_file):
    try:
        df = pd.read_csv(csv_file, encoding='utf-8')
        print("Columns:", df.columns.tolist())
        print("Shape:", df.shape)
        print("\nFirst row sample:")
        print(df.iloc[0])
    except Exception as e:
        print(f"Error reading CSV: {e}")
else:
    print(f"{csv_file} does not exist.")
