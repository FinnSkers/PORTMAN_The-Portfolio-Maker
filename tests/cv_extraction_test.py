# Test file for enhanced CV extraction
# This file contains sample CVs and tests the extraction accuracy

import requests
import json
import time

# Test CV samples
test_cvs = [
    {
        "name": "Software Engineer CV",
        "text": """
John Smith
Software Engineer
Email: john.smith@techcorp.com
Phone: +1-555-123-4567
LinkedIn: linkedin.com/in/johnsmith

PROFESSIONAL SUMMARY
Experienced Software Engineer with 5+ years developing scalable web applications using modern technologies. 
Proven track record in full-stack development, cloud architecture, and team leadership.

EDUCATION
Bachelor of Science in Computer Science
Massachusetts Institute of Technology (MIT)
Graduated: May 2019
GPA: 3.8/4.0

WORK EXPERIENCE

Senior Software Engineer | Google Inc. | Jan 2022 - Present
• Led development of microservices architecture serving 10M+ users
• Implemented CI/CD pipelines reducing deployment time by 60%
• Mentored 3 junior developers and conducted code reviews
• Technologies: Python, JavaScript, React, Node.js, Kubernetes, AWS

Software Engineer | Amazon Web Services | Jun 2019 - Dec 2021
• Developed RESTful APIs for cloud storage services
• Optimized database queries improving performance by 40%
• Collaborated with cross-functional teams on product roadmap
• Technologies: Java, Spring Boot, PostgreSQL, Docker

TECHNICAL SKILLS
Programming Languages: Python, JavaScript, Java, TypeScript, Go
Web Technologies: React, Angular, Node.js, Express.js, HTML5, CSS3
Databases: PostgreSQL, MongoDB, Redis, DynamoDB
Cloud & DevOps: AWS, Docker, Kubernetes, Jenkins, Terraform
Tools: Git, JIRA, Slack, VS Code

PROJECTS
E-Commerce Platform (2021)
• Built full-stack e-commerce application using MERN stack
• Integrated Stripe payment processing and real-time chat
• Deployed on AWS with auto-scaling capabilities

Open Source Contributions
• Contributor to React.js and Node.js projects on GitHub
• Published 3 NPM packages with 10K+ downloads
"""
    },
    {
        "name": "Marketing Manager CV",
        "text": """
Sarah Johnson
Digital Marketing Manager
sarah.johnson@marketpro.com | (555) 987-6543
New York, NY 10001

SUMMARY
Results-driven Digital Marketing Manager with 7+ years of experience in developing and executing 
comprehensive marketing strategies. Expertise in SEO, content marketing, and data analytics.

EDUCATION
Master of Business Administration (MBA) - Marketing
Harvard Business School | 2017
Bachelor of Arts in Communications
New York University | 2015

PROFESSIONAL EXPERIENCE

Senior Digital Marketing Manager | TechStartup Inc. | Mar 2020 - Present
• Increased organic traffic by 150% through SEO optimization and content strategy
• Managed $2M annual marketing budget across multiple channels
• Led team of 8 marketing professionals across content, social media, and paid advertising
• Implemented marketing automation resulting in 35% increase in lead quality

Marketing Manager | Creative Agency LLC | Aug 2017 - Feb 2020
• Developed integrated marketing campaigns for B2B and B2C clients
• Managed social media accounts with combined following of 500K+
• Created content strategy increasing client engagement by 85%
• Coordinated with design and development teams on campaign execution

Marketing Coordinator | Local Business Group | Jun 2015 - Jul 2017
• Supported marketing initiatives for small business clients
• Conducted market research and competitive analysis
• Assisted in event planning and execution for trade shows

CORE COMPETENCIES
Digital Marketing: SEO, SEM, Content Marketing, Email Marketing
Analytics: Google Analytics, Adobe Analytics, HubSpot, Salesforce
Social Media: Facebook Ads, LinkedIn Ads, Instagram, Twitter
Tools: Photoshop, Canva, Hootsuite, Mailchimp, WordPress
Project Management: Asana, Trello, Monday.com

ACHIEVEMENTS
• Google Analytics Certified Professional (2019)
• HubSpot Content Marketing Certification (2020)
• Led campaign that generated $5M in revenue for client (2021)
"""
    }
]

def test_cv_extraction():
    """Test the enhanced CV extraction service"""
    base_url = "http://localhost:6000"
    
    print("Testing Enhanced CV Extraction Service")
    print("=" * 50)
    
    # Test health check first
    try:
        health_response = requests.get(f"{base_url}/health")
        if health_response.status_code == 200:
            print("✅ Health check passed")
        else:
            print("❌ Health check failed")
            return
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to CV extraction service. Make sure it's running on port 6000")
        return
    
    # Test each CV
    for i, cv_sample in enumerate(test_cvs, 1):
        print(f"\n🔍 Testing CV {i}: {cv_sample['name']}")
        print("-" * 30)
        
        try:
            response = requests.post(
                f"{base_url}/parse-cv",
                json={"text": cv_sample["text"]},
                timeout=45
            )
            
            if response.status_code == 200:
                extracted_data = response.json()
                
                print("✅ Extraction successful!")
                print(f"📧 Email: {extracted_data.get('email', 'Not found')}")
                print(f"📞 Phone: {extracted_data.get('phone', 'Not found')}")
                print(f"👤 Name: {extracted_data.get('name', 'Not found')}")
                print(f"🎓 Education entries: {len(extracted_data.get('education', []))}")
                print(f"💼 Experience entries: {len(extracted_data.get('experience', []))}")
                print(f"🛠️ Skills found: {len(extracted_data.get('skills', []))}")
                
                # Show some extracted skills
                skills = extracted_data.get('skills', [])
                if skills:
                    print(f"   Sample skills: {', '.join(skills[:5])}")
                
                # Show experience titles
                experiences = extracted_data.get('experience', [])
                if experiences:
                    print("   Experience titles:")
                    for exp in experiences[:3]:  # Show first 3
                        title = exp.get('title', 'Unknown')
                        company = exp.get('company', 'Unknown')
                        print(f"     - {title} at {company}")
                
                print(f"\n📊 Full extracted data:")
                print(json.dumps(extracted_data, indent=2))
                
            else:
                print(f"❌ Extraction failed with status {response.status_code}")
                print(f"Error: {response.text}")
                
        except requests.exceptions.Timeout:
            print("⏰ Request timed out - LLM might be slow")
        except Exception as e:
            print(f"❌ Error: {e}")
        
        # Wait between tests
        if i < len(test_cvs):
            print("\nWaiting 3 seconds before next test...")
            time.sleep(3)
    
    print("\n" + "=" * 50)
    print("CV Extraction Testing Complete")

if __name__ == "__main__":
    test_cv_extraction()
