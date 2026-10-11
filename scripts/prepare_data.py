import os
import re
import json
import shutil
import pandas as pd

def normalize_key(key):
    return str(key).strip().lower().replace('_', ' ').replace('.', '').replace('-', '')

def get_row_val(row_dict_norm, *candidate_keys, default=""):
    for k in candidate_keys:
        norm_k = normalize_key(k)
        if norm_k in row_dict_norm:
            val = row_dict_norm[norm_k]
            if pd.notna(val) and val is not None:
                val_str = str(val).strip()
                if val_str.lower() != 'nan' and val_str != '':
                    return val_str
    return default

def clean_camel_case(s):
    s = re.sub(r'([a-z])([A-Z])', r'\1 \2', s)
    s = re.sub(r'([A-Z]+)([A-Z][a-z])', r'\1 \2', s)
    return s.strip()

def normalize_section_name(raw_name):
    if not raw_name or raw_name.lower() == 'nan':
        return "General Aptitude"
    
    s=clean_camel_case(str(raw_name).strip())
    s_lower = s.lower()
    
    if 'sql' in s_lower:
        return 'SQL Basics'
    if 'cloud' in s_lower:
        return 'Cloud Basics'
    if ('gen' in s_lower and 'ai' in s_lower) or 'generative' in s_lower:
        return 'Generative AI'
    if 'numerical' in s_lower or 'arithmetic' in s_lower:
        return 'Arithmetic Ability'
    if 'math' in s_lower:
        return 'Mathematical Ability'
    if 'puzzle' in s_lower:
        if 'solving' in s_lower:
            return 'Puzzle Solving'
        return 'Puzzles & Games'
    if 'pseudo' in s_lower:
        return 'Pseudo Code'
    if 'logical' in s_lower:
        return 'Logical Reasoning'
    if 'verbal' in s_lower:
        return 'Verbal Ability'
    
    return s

def normalize_difficulty(val):
    v = str(val).strip().capitalize()
    if 'Easy' in v:
        return 'Easy'
    if 'Hard' in v:
        return 'Hard'
    return 'Medium'

def normalize_answer(ans_val, options):
    if not ans_val:
        return 'A'
    ans_str = str(ans_val).strip()
    
    m = re.match(r'^(?:option\s*)?([A-D])\b', ans_str, re.IGNORECASE)
    if m:
        return m.group(1).upper()
        
    m_num = re.match(r'^([1-4])$', ans_str)
    if m_num:
        return ['A', 'B', 'C', 'D'][int(m_num.group(1)) - 1]
        
    for letter, opt_val in options.items():
        if opt_val and ans_str.lower() == str(opt_val).strip().lower():
            return letter

    first_char = ans_str[:1].upper()
    return first_char if first_char in ['A', 'B', 'C', 'D'] else 'A'

def process_excel_files(base_dir="Question_bank", output_file="public/data/questions.json", companies_file="public/data/companies.json"):
    all_questions = []
    company_stats = {}
    
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    images_dest_dir = os.path.join("public", "images")
    os.makedirs(images_dest_dir, exist_ok=True)
    
    if not os.path.exists(base_dir):
        print(f"Directory {base_dir} does not exist.")
        return

    company_folders = [
        d for d in os.listdir(base_dir) 
        if os.path.isdir(os.path.join(base_dir, d)) and not d.startswith('.') and not d.startswith('~')
    ]
    print(f"Discovered target companies in {base_dir}: {company_folders}")

    for root, dirs, files in os.walk(base_dir):
        if os.path.basename(root).lower() == 'images':
            for img_file in files:
                if img_file.lower().endswith(('.svg', '.png', '.jpg', '.jpeg', '.webp')):
                    src_img = os.path.join(root, img_file)
                    dst_img = os.path.join(images_dest_dir, img_file)
                    try:
                        shutil.copy2(src_img, dst_img)
                    except Exception as e:
                        print(f"Error copying image {src_img}: {e}")

        for file in files:
            if file.endswith('.xlsx') and not file.startswith('~'):
                file_path = os.path.join(root, file)
                print(f"Processing: {file_path}")
                
                rel_path = os.path.relpath(root, base_dir)
                parts = rel_path.split(os.sep)
                company = parts[0] if parts and parts[0] != '.' else 'General'
                
                section_from_dir = parts[1] if len(parts) > 1 else None
                
                try:
                    df = pd.read_excel(file_path)
                    
                    for index, row in df.iterrows():
                        row_dict = row.to_dict()
                        row_norm = {normalize_key(k): v for k, v in row_dict.items()}
                        
                        question_text = get_row_val(row_norm, 'question', 'problem', 'q', 'question text')
                        if not question_text:
                            continue

                        pseudocode = get_row_val(row_norm, 'pseudocode', 'code', 'snippet', 'code snippet')
                        puzzle_setup = get_row_val(row_norm, 'puzzle setup', 'setup', 'context', 'passage', 'description')
                        
                        full_question = ""
                        if pseudocode:
                            full_question += f"Code Snippet:\n```\n{pseudocode}\n```\n\n"
                        if puzzle_setup:
                            full_question += f"Context / Setup:\n{puzzle_setup}\n\n"
                        full_question += question_text
                        
                        opt_a = get_row_val(row_norm, 'option a', 'option_a', 'option 1', 'opt a', 'a')
                        opt_b = get_row_val(row_norm, 'option b', 'option_b', 'option 2', 'opt b', 'b')
                        opt_c = get_row_val(row_norm, 'option c', 'option_c', 'option 3', 'opt c', 'c')
                        opt_d = get_row_val(row_norm, 'option d', 'option_d', 'option 4', 'opt d', 'd')
                        
                        options = {
                            "A": opt_a,
                            "B": opt_b,
                            "C": opt_c,
                            "D": opt_d
                        }
                        
                        raw_ans = get_row_val(row_norm, 'correct answer', 'answer', 'correct', 'key', 'correct option', 'ans')
                        answer = normalize_answer(raw_ans, options)
                        
                        raw_diff = get_row_val(row_norm, 'difficulty', 'level', 'diff', default='Medium')
                        difficulty = normalize_difficulty(raw_diff)
                        
                        if section_from_dir:
                            raw_sec = section_from_dir
                        else:
                            raw_sec = get_row_val(row_norm, 'section', 'category', default=os.path.splitext(file)[0])
                        section = normalize_section_name(raw_sec)
                        
                        topic = get_row_val(row_norm, 'topic', 'category', default="")
                        explanation = get_row_val(row_norm, 'explanation', 'solution', 'rationale', 'explain', default="")
                        
                        #Generate unique id
                        raw_id = get_row_val(row_norm, 'id', 'qno', 'q no', 'question id', default=f"{file}_{index}")
                        q_id = f"{company}_{file}_{raw_id}"
                        
                        question_data = {
                            "id": q_id,
                            "company": company,
                            "section": section,
                            "topic": topic,
                            "difficulty": difficulty,
                            "question": full_question,
                            "options": options,
                            "answer": answer,
                            "explanation": explanation
                        }
                        
                        raw_img = get_row_val(row_norm, 'image', 'img', 'diagram', default="")
                        if raw_img:
                            img_name = os.path.basename(raw_img.strip())
                            question_data["image"] = f"/images/{img_name}"
                            
                        all_questions.append(question_data)
                        
                        if company not in company_stats:
                            company_stats[company] = {"sections": {}}
                        if section not in company_stats[company]["sections"]:
                            company_stats[company]["sections"][section] = 0
                        company_stats[company]["sections"][section] += 1

                except Exception as e:
                    print(f"Error processing {file_path}: {e}")

    companies_list = []
    all_companies = sorted(list(set(company_folders + list(company_stats.keys()))))
    
    for comp in all_companies:
        sections_dict = company_stats.get(comp, {}).get("sections", {})
        total_q = sum(sections_dict.values())
        sections_arr = [
            {"section": sec, "questionCount": count}
            for sec, count in sorted(sections_dict.items(), key=lambda x: x[0])
        ]
        companies_list.append({
            "name": comp,
            "totalQuestions": total_q,
            "sections": sections_arr
        })
        
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(all_questions, f, indent=4)
    print(f"Successfully wrote {len(all_questions)} questions to {output_file}")
    with open(companies_file, 'w', encoding='utf-8') as f:
        json.dump(companies_list, f, indent=4)
    print(f"Successfully wrote {len(companies_list)} companies metadata to {companies_file}")

if __name__ == "__main__":
    process_excel_files("Question_bank", "public/data/questions.json", "public/data/companies.json")
