import os
import pandas as pd
import json

def process_excel_files(base_dir, output_file):
    all_questions = []
    
    # Iterate through all files in base_dir
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file.endswith('.xlsx') and not file.startswith('~'):
                file_path = os.path.join(root, file)
                print(f"Processing: {file_path}")
                try:
                    df = pd.read_excel(file_path)
                    
                    # Ensure required columns exist, mapping if necessary
                    # Assuming columns: id, section, difficulty, question, option_a, option_b, option_c, option_d, answer, explanation
                    # Some files might have missing explanation or slight variations.
                    
                    for index, row in df.iterrows():
                        # Basic validation to ensure it's a valid row
                        if pd.isna(row.get('question')):
                            continue
                            
                        question_data = {
                            "id": str(row.get('id', f"{file}_{index}")),
                            "section": str(row.get('section', os.path.basename(root))).strip(),
                            "difficulty": str(row.get('difficulty', 'Medium')).strip(),
                            "question": str(row.get('question')),
                            "options": {
                                "A": str(row.get('option_a', '')),
                                "B": str(row.get('option_b', '')),
                                "C": str(row.get('option_c', '')),
                                "D": str(row.get('option_d', ''))
                            },
                            "answer": str(row.get('answer', '')).strip().upper(),
                            "explanation": str(row.get('explanation', '')) if not pd.isna(row.get('explanation')) else ""
                        }
                        
                        if 'image' in df.columns and not pd.isna(row.get('image')):
                            # Remove the 'images/' prefix from the excel path as we copy the whole images folder
                            # wait, in excel the path is 'images/sudoku_001.svg'
                            # if we copied images folder into public/images, then the URL from root is '/images/sudoku_001.svg'
                            image_path = str(row.get('image'))
                            if not image_path.startswith('/'):
                                image_path = '/' + image_path
                            question_data['image'] = image_path
                        
                        
                        # Fix section names to match standard if they differ
                        section_map = {
                            'SQL': 'SQL Basics',
                            'Cloud': 'Cloud Basics',
                            'Verbal': 'Verbal Ability',
                            'Logical': 'Logical Reasoning',
                            'Puzzles': 'Puzzles & Games',
                            'Numerical': 'Arithmetic Ability',
                            'GenAI': 'Generative AI'
                        }
                        
                        # Try to map section name if it's just the folder name or similar
                        for key, val in section_map.items():
                            if key.lower() in question_data['section'].lower():
                                question_data['section'] = val
                                break
                                
                        all_questions.append(question_data)
                except Exception as e:
                    print(f"Error processing {file_path}: {e}")
                    
    # Write to JSON
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_questions, f, indent=4)
        
    print(f"Successfully wrote {len(all_questions)} questions to {output_file}")

if __name__ == "__main__":
    process_excel_files("Question_bank", "public/data/questions.json")
