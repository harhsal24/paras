import pandas as pd
import os

excel_file = 'Chapter_1.xlsx'

if os.path.exists(excel_file):
    try:
        df = pd.read_excel(excel_file)
        print("Columns:", df.columns.tolist())
        print("Shape:", df.shape)
        print("\nFirst row sample:")
        print(df.iloc[0])
    except Exception as e:
        print(f"Error reading Excel: {e}")
else:
    print(f"{excel_file} does not exist.")
