# Advanced CV Parser for PORTMAN: The Portfolio Maker
# Enhanced with DeepSeek-R1 AI for intelligent PDF scanning, website generation, and RAG
# This microservice provides comprehensive CV analysis with advanced reasoning capabilities

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import re
import json as pyjson
from datetime import datetime
import logging
import os
from dotenv import load_dotenv
import PyPDF2
from docx import Document
import io
from pymongo import MongoClient
import traceback

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

LOG_FILE = 'backend_errors.log'
def log_backend_error(message, details=None):
    with open(LOG_FILE, 'a', encoding='utf-8') as f:
        f.write(f"[{datetime.now().isoformat()}] {message}\n")
        if details:
            f.write(f"Details: {details}\n")
        f.write("\n")

# Add CORS headers to all responses
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# OpenRouter API Configuration with DeepSeek-R1 (Advanced Reasoning Model)
OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'
OPENROUTER_API_KEY = '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'
OPENROUTER_MODEL = 'deepseek/deepseek-r1-0528-qwen3-8b:free'  # Advanced reasoning model for complex CV analysis

# Fallback models
GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
GROQ_API_KEY = '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'
GROQ_MODEL = 'llama-3.1-8b-instant'

# RAG Configuration
VECTOR_STORE_PATH = 'cv_knowledge_base.json'
EMBEDDING_MODEL = 'text-embedding-3-small'  # OpenRouter embedding model

# Fallback models
GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
GROQ_API_KEY = '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'
GROQ_MODEL = 'llama-3.1-8b-instant'

# RAG Configuration
VECTOR_STORE_PATH = 'cv_knowledge_base.json'
EMBEDDING_MODEL = 'text-embedding-3-small'  # OpenRouter embedding model

# Enhanced CV parsing with few-shot examples and better prompting
def create_enhanced_prompt(cv_text):
    """Create an enhanced prompt with few-shot examples for better CV extraction"""
    
    examples = """
EXAMPLE 1:
CV: "John Smith, Software Engineer. Email: john.smith@email.com, Phone: +1-555-123-4567
Education: BS Computer Science, MIT, 2020
Experience: Software Engineer at Google (2020-2023), Junior Developer at Startup Inc (2019-2020)
Skills: Python, JavaScript, React, Node.js, AWS"

Expected JSON:
{
  "name": "John Smith",
  "email": "john.smith@email.com",
  "phone": "+1-555-123-4567",
  "summary": "Software Engineer with experience at Google and startup environments",
  "education": [
    {
      "degree": "BS Computer Science",
      "institution": "MIT",
      "year": "2020"
    }
  ],
  "experience": [
    {
      "title": "Software Engineer",
      "company": "Google",
      "duration": "2020-2023",
      "description": "Software Engineer at Google"
    },
    {
      "title": "Junior Developer",
      "company": "Startup Inc",
      "duration": "2019-2020",
      "description": "Junior Developer at Startup Inc"
    }
  ],
  "skills": ["Python", "JavaScript", "React", "Node.js", "AWS"],
  "projects": []
}

EXAMPLE 2:
CV: "Sarah Johnson
Marketing Manager | sarah.j@company.com | (555) 987-6543
MBA Marketing, Harvard Business School, 2018
Senior Marketing Manager, Tech Corp (Jan 2021 - Present)
- Led digital marketing campaigns increasing revenue by 40%
- Managed team of 8 marketing professionals
Marketing Specialist, StartupXYZ (2018-2020)
Skills: Digital Marketing, SEO, Google Analytics, Content Strategy"

Expected JSON:
{
  "name": "Sarah Johnson",
  "email": "sarah.j@company.com",
  "phone": "(555) 987-6543",
  "summary": "Marketing Manager with MBA and proven track record in digital marketing",
  "education": [
    {
      "degree": "MBA Marketing",
      "institution": "Harvard Business School",
      "year": "2018"
    }
  ],
  "experience": [
    {
      "title": "Senior Marketing Manager",
      "company": "Tech Corp",
      "duration": "Jan 2021 - Present",
      "description": "Led digital marketing campaigns increasing revenue by 40%. Managed team of 8 marketing professionals"
    },
    {
      "title": "Marketing Specialist",
      "company": "StartupXYZ",
      "duration": "2018-2020",
      "description": "Marketing Specialist at StartupXYZ"
    }
  ],
  "skills": ["Digital Marketing", "SEO", "Google Analytics", "Content Strategy"],
  "projects": []
}
"""
    
    prompt = f"""You are an expert CV/Resume parser. Extract structured information from CVs and return ONLY a valid JSON object.

{examples}

NOW PARSE THIS CV:
{cv_text}

Instructions:
1. Extract name, email, phone, summary, education, experience, skills, and projects
2. For experience: include title, company, duration, and description
3. For education: include degree, institution, and year
4. Skills should be an array of individual skills
5. Return ONLY the JSON object, no other text
6. If information is missing, use empty string "" or empty array []
7. Ensure all JSON is properly formatted and valid

JSON:"""
    
    return prompt

def extract_with_regex_fallback(cv_text):
    """Fallback regex extraction for basic information"""
    extracted = {
        "name": "",
        "email": "",
        "phone": "",
        "summary": "",
        "education": [],
        "experience": [],
        "skills": [],
        "projects": []
    }
    
    # Email extraction
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    emails = re.findall(email_pattern, cv_text)
    if emails:
        extracted["email"] = emails[0]
    
    # Phone extraction
    phone_pattern = r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
    phones = re.findall(phone_pattern, cv_text)
    if phones:
        extracted["phone"] = ''.join(phones[0]) if isinstance(phones[0], tuple) else phones[0]
    
    # Skills extraction (common tech skills)
    common_skills = [
        'Python', 'JavaScript', 'Java', 'C++', 'C#', 'HTML', 'CSS', 'React', 'Angular', 'Vue',
        'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'MongoDB', 'PostgreSQL', 'MySQL',
        'AWS', 'Azure', 'Docker', 'Kubernetes', 'Git', 'Jenkins', 'Linux', 'Windows',
        'Machine Learning', 'Data Science', 'Artificial Intelligence', 'Deep Learning',
        'Marketing', 'SEO', 'Google Analytics', 'Content Strategy', 'Social Media',
        'Project Management', 'Agile', 'Scrum', 'Leadership', 'Communication'
    ]
    
    found_skills = []
    for skill in common_skills:
        if skill.lower() in cv_text.lower():
            found_skills.append(skill)
    
    extracted["skills"] = found_skills
    
    return extracted

def extract_with_groq_llm(cv_text):
    """Extract CV data using Groq API (free, fast, no download)"""
    if not GROQ_API_KEY:
        logger.warning("Groq API key not set. Skipping Groq extraction.")
        return None
    try:
        prompt = create_enhanced_prompt(cv_text)
        headers = {
            'Authorization': f'Bearer {GROQ_API_KEY}',
            'Content-Type': 'application/json'
        }
        payload = {
            'model': GROQ_MODEL,
            'messages': [
                {
                    'role': 'user',
                    'content': prompt
                }
            ],
            'temperature': 0.1,
            'max_tokens': 1000
        }
        response = requests.post(GROQ_API_URL, json=payload, headers=headers, timeout=30)
        if response.status_code == 200:
            result = response.json()
            content = result['choices'][0]['message']['content']
            # Try to extract JSON from response
            json_match = re.search(r'\{[\s\S]*\}', content)
            if json_match:
                extracted_data = pyjson.loads(json_match.group(0))
                return extracted_data  # Return as-is
    except Exception as e:
        logger.error(f"Groq extraction error: {e}")
    return None

def extract_with_openrouter_llm(cv_text):
    """Extract CV data using OpenRouter API (free tier available)"""
    if not OPENROUTER_API_KEY:
        logger.warning("OpenRouter API key not set. Skipping OpenRouter extraction.")
        return None
    try:
        prompt = create_enhanced_prompt(cv_text)
        headers = {
            'Authorization': f'Bearer {OPENROUTER_API_KEY}',
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',  # Required by OpenRouter
            'X-Title': 'PORTMAN CV Parser'
        }
        payload = {
            'model': OPENROUTER_MODEL,
            'messages': [
                {
                    'role': 'user',
                    'content': prompt
                }
            ],
            'temperature': 0.1,            'max_tokens': 1000
        }
        response = requests.post(OPENROUTER_API_URL, json=payload, headers=headers, timeout=60)
        if response.status_code == 200:
            result = response.json()
            content = result['choices'][0]['message']['content']
            # DeepSeek-R1 includes reasoning, extract final JSON
            json_match = re.search(r'\{[\s\S]*\}', content.split('Final Answer:')[-1] if 'Final Answer:' in content else content)
            if json_match:
                extracted_data = pyjson.loads(json_match.group(0))
                return extracted_data  # Return as-is
    except Exception as e:
        logger.error(f"DeepSeek-R1 extraction error: {e}")
    return None

def create_deepseek_reasoning_prompt(cv_text):
    """Create enhanced prompt for DeepSeek-R1's reasoning capabilities"""
    
    prompt = f"""<thinking>
I need to analyze this CV/Resume text and extract structured information. Let me think through this step by step:

1. First, I'll identify the candidate's basic information (name, contact details)
2. Then I'll parse their educational background
3. Next, I'll analyze their work experience chronologically
4. I'll extract technical and soft skills
5. Finally, I'll look for any projects or certifications

The goal is to create a comprehensive JSON structure that captures all relevant information for portfolio website generation.
</thinking>

You are an expert CV/Resume parser with advanced reasoning capabilities. Analyze this CV text and extract comprehensive structured information.

**CV Text to Analyze:**
{cv_text}

**Analysis Requirements:**
1. **Contact Information**: Extract name, email, phone, LinkedIn, GitHub, website
2. **Professional Summary**: Create a concise 2-3 sentence summary
3. **Education**: Extract degrees, institutions, years, GPA if mentioned
4. **Experience**: Parse job titles, companies, dates, key achievements
5. **Skills**: Categorize into technical skills, soft skills, tools/technologies
6. **Projects**: Extract project names, descriptions, technologies used
7. **Certifications**: Any professional certifications or licenses
8. **Languages**: Programming languages and spoken languages

**Output Format**: Return ONLY a valid JSON object with this structure:
```json
{{
  "name": "Full Name",
  "email": "email@domain.com",
  "phone": "+1-xxx-xxx-xxxx",
  "linkedin": "linkedin.com/in/profile",
  "github": "github.com/username",
  "website": "personal-website.com",
  "summary": "Professional summary highlighting key strengths and experience",
  "education": [
    {{
      "degree": "Degree Name",
      "field": "Field of Study",
      "institution": "University Name",
      "year": "2020",
      "gpa": "3.8/4.0"
    }}
  ],
  "experience": [
    {{
      "title": "Job Title",
      "company": "Company Name",
      "duration": "Jan 2020 - Present",
      "location": "City, State",
      "description": "Key achievements and responsibilities",
      "technologies": ["Tech1", "Tech2"]
    }}
  ],
  "skills": {{
    "technical": ["Programming languages", "Frameworks"],
    "soft": ["Leadership", "Communication"],
    "tools": ["Software", "Platforms"]
  }},
  "projects": [
    {{
      "name": "Project Name",
      "description": "Project description",
      "technologies": ["Tech1", "Tech2"],
      "link": "github.com/project"
    }}
  ],
  "certifications": ["Certification names"],
  "languages": {{
    "programming": ["Python", "JavaScript"],
    "spoken": ["English", "Spanish"]
  }}
}}
```

**Important**: 
- Use empty strings "" for missing text fields
- Use empty arrays [] for missing list fields
- Ensure all JSON is properly formatted and valid
- Include reasoning in your analysis but provide final JSON only

JSON:"""
    
    return prompt

def create_rag_knowledge_base():
    """Create and maintain a RAG knowledge base for CV parsing"""
    knowledge_base = {
        "skill_mappings": {
            "programming": ["Python", "Java", "JavaScript", "C++", "C#", "Go", "Rust", "PHP", "Ruby", "Swift", "Kotlin"],
            "web_frameworks": ["React", "Angular", "Vue.js", "Django", "Flask", "Express.js", "Spring Boot", "ASP.NET"],
            "databases": ["MySQL", "PostgreSQL", "MongoDB", "Redis", "Elasticsearch", "SQLite", "Oracle"],
            "cloud_platforms": ["AWS", "Azure", "Google Cloud", "DigitalOcean", "Heroku", "Vercel"],
            "devops_tools": ["Docker", "Kubernetes", "Jenkins", "GitLab CI", "GitHub Actions", "Terraform"],
            "data_science": ["Pandas", "NumPy", "TensorFlow", "PyTorch", "Scikit-learn", "Jupyter", "R"]
        },
        "company_industries": {
            "tech_giants": ["Google", "Microsoft", "Amazon", "Apple", "Meta", "Netflix"],
            "consulting": ["McKinsey", "BCG", "Deloitte", "Accenture", "PwC"],
            "finance": ["Goldman Sachs", "Morgan Stanley", "JPMorgan", "BlackRock"],
            "startups": ["Y Combinator", "Techstars", "500 Startups"]
        },
        "education_rankings": {
            "top_universities": ["MIT", "Stanford", "Harvard", "Caltech", "UC Berkeley"],
            "business_schools": ["Wharton", "Harvard Business School", "Stanford GSB", "Kellogg"]
        }
    }
    
    # Save knowledge base
    with open(VECTOR_STORE_PATH, 'w') as f:
        pyjson.dump(knowledge_base, f, indent=2)
    
    return knowledge_base

def enhance_with_rag(extracted_data):
    """Enhance extracted CV data using RAG knowledge base"""
    try:
        # Load or create knowledge base
        if os.path.exists(VECTOR_STORE_PATH):
            with open(VECTOR_STORE_PATH, 'r') as f:
                kb = pyjson.load(f)
        else:
            kb = create_rag_knowledge_base()
        
        # Enhance skills categorization
        if "skills" in extracted_data:
            skills = extracted_data.get("skills", [])
            if isinstance(skills, list):
                # Convert flat skills list to categorized structure
                categorized_skills = {
                    "technical": [],
                    "soft": [],
                    "tools": []
                }
                
                for skill in skills:
                    skill_lower = skill.lower()
                    categorized = False
                    
                    # Check against knowledge base categories
                    for category, skill_list in kb["skill_mappings"].items():
                        if any(known_skill.lower() in skill_lower or skill_lower in known_skill.lower() 
                               for known_skill in skill_list):
                            categorized_skills["technical"].append(skill)
                            categorized = True
                            break
                    
                    if not categorized:
                        # Default to soft skills for uncategorized items
                        if skill in ["Leadership", "Communication", "Teamwork", "Problem Solving"]:
                            categorized_skills["soft"].append(skill)
                        else:
                            categorized_skills["tools"].append(skill)
                
                extracted_data["skills"] = categorized_skills
        
        # Enhance company information
        if "experience" in extracted_data:
            for exp in extracted_data["experience"]:
                company = exp.get("company", "")
                for industry, companies in kb["company_industries"].items():
                    if company in companies:
                        exp["industry"] = industry
                        break
        
        return extracted_data
        
    except Exception as e:
        logger.error(f"RAG enhancement error: {e}")
        return extracted_data

# MongoDB setup (adjust URI as needed)
mongo_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/')
mongo_client = MongoClient(mongo_uri)
db = mongo_client['portman']
cv_comparisons = db['cv_comparisons']

@app.route('/parse-cv', methods=['POST'])
def parse_cv():
    """Enhanced CV parsing with LLM and regex fallback, returns normalized data"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        if not text.strip():
            return jsonify({'error': 'No CV text provided'}), 400
        logger.info(f"Processing CV text of length: {len(text)}")

        # Try LLM extraction first (Groq API)
        try:
            extracted_data = extract_with_groq_llm(text)
            if extracted_data:
                logger.info("Successfully extracted CV data using Groq LLM (raw)")
                extracted_data = normalize_cv_schema(extracted_data)
                return jsonify(extracted_data)
        except Exception as e:
            logger.error(f"Groq LLM extraction failed: {e}")

        # Try OpenRouter as fallback
        try:
            extracted_data = extract_with_openrouter_llm(text)
            if extracted_data:
                logger.info("Successfully extracted CV data using OpenRouter LLM (raw)")
                extracted_data = normalize_cv_schema(extracted_data)
                return jsonify(extracted_data)
        except Exception as e:
            logger.error(f"OpenRouter LLM extraction failed: {e}")

        # Fallback to regex extraction (raw)
        logger.info("Falling back to regex extraction (raw)")
        fallback_data = extract_with_regex_fallback(text)
        fallback_data = normalize_cv_schema(fallback_data)
        return jsonify(fallback_data)
    except Exception as e:
        logger.error(f"CV parsing error: {e}")
        return jsonify({'error': f'CV parsing failed: {str(e)}'}), 500

# Utility: Normalize CV data to ensure all fields are present and arrays are deduped

def normalize_cv_schema(data):
    schema = {
        "name": "",
        "email": "",
        "phone": "",
        "linkedin": "",
        "github": "",
        "website": "",
        "summary": "",
        "education": [],
        "experience": [],
        "skills": {"technical": [], "soft": [], "tools": []},
        "projects": [],
        "certifications": [],
        "languages": {"programming": [], "spoken": []}
    }
    out = {**schema, **data}
    # Deduplicate arrays
    def dedupe(arr):
        try:
            return list({pyjson.dumps(x, sort_keys=True) for x in arr})
        except Exception:
            return list(set(arr))
    if isinstance(out.get("education"), list):
        out["education"] = [pyjson.loads(x) if isinstance(x, str) else x for x in dedupe(out["education"])]
    if isinstance(out.get("experience"), list):
        out["experience"] = [pyjson.loads(x) if isinstance(x, str) else x for x in dedupe(out["experience"])]
    if isinstance(out.get("projects"), list):
        out["projects"] = [pyjson.loads(x) if isinstance(x, str) else x for x in dedupe(out["projects"])]
    if isinstance(out.get("certifications"), list):
        out["certifications"] = list(set(out["certifications"]))
    if isinstance(out.get("skills"), dict):
        for k in schema["skills"]:
            if not isinstance(out["skills"].get(k), list):
                out["skills"][k] = []
            else:
                out["skills"][k] = list(set(out["skills"][k]))
    if isinstance(out.get("languages"), dict):
        for k in schema["languages"]:
            if not isinstance(out["languages"].get(k), list):
                out["languages"][k] = []
            else:
                out["languages"][k] = list(set(out["languages"][k]))
    # Ensure all string fields are strings
    for k in schema:
        if isinstance(schema[k], str) and not isinstance(out[k], str):
            out[k] = ""
    return out

@app.route('/compare-cv', methods=['POST'])
def compare_cv():
    """Compare CV with related professionals using RAG+DeepSeek, return suggestions, and store in DB."""
    try:
        data = request.get_json()
        cv_data = data.get('cv_data')
        if not cv_data:
            return jsonify({'error': 'No CV data provided'}), 400
        # Compose prompt for DeepSeek to compare with top professionals
        prompt = f"""
You are an expert career advisor and data visualizer. Compare the following CV data with top professionals in the same field (using your RAG and knowledge base). Identify strengths, weaknesses, and suggest improvements. Return a JSON with:
- 'comparison': a detailed, sectioned comparison (skills, experience, education, etc.)
- 'suggestions': actionable, prioritized suggestions (with links to resources, articles, or courses)
- 'related_profiles': 2-3 real or realistic profiles (with name, title, summary, and links to LinkedIn, GitHub, or portfolio)
- 'display_format': a suggested way to visually present the comparison (e.g., highlight differences, use icons, show links)

CV Data:
{pyjson.dumps(cv_data, indent=2)}

Instructions:
- Use your knowledge and retrieval to find relevant profiles.
- Provide actionable suggestions for improvement, with links.
- Output only a JSON object, with clickable URLs where possible.
- Make the comparison detailed and easy to visualize in a UI.
"""
        headers = {
            'Authorization': f'Bearer {OPENROUTER_API_KEY}',
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'PORTMAN CV Comparison'
        }
        payload = {
            'model': OPENROUTER_MODEL,
            'messages': [
                {'role': 'user', 'content': prompt}
            ],
            'temperature': 0.2,
            'max_tokens': 1600
        }
        response = requests.post(OPENROUTER_API_URL, json=payload, headers=headers, timeout=90)
        if response.status_code == 200:
            result = response.json()
            content = result['choices'][0]['message']['content']
            json_match = re.search(r'\{[\s\S]*\}', content)
            if json_match:
                comparison_data = pyjson.loads(json_match.group(0))
                # Store in MongoDB
                cv_comparisons.insert_one({
                    'cv_data': cv_data,
                    'comparison': comparison_data,
                    'timestamp': datetime.utcnow()
                })
                return jsonify(comparison_data)
        return jsonify({'error': 'Failed to get comparison from DeepSeek', 'details': response.text}), 500
    except Exception as e:
        tb = traceback.format_exc()
        log_backend_error('CV comparison error', tb)
        logger.error(f"CV comparison error: {e}", exc_info=True)
        return jsonify({'error': f'CV comparison failed: {str(e)}'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.errorhandler(Exception)
def handle_exception(e):
    tb = traceback.format_exc()
    log_backend_error('Flask Unhandled Exception', tb)
    logger.error(f"Unhandled Exception: {e}", exc_info=True)
    return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

if __name__ == '__main__':
    app.run(port=6060, debug=True, host="0.0.0.0", use_reloader=False)
