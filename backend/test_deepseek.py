#!/usr/bin/env python3
"""
Simple test script for the enhanced DeepSeek CV parser
"""

import requests
import json

def test_cv_parser():
    """Test the DeepSeek CV parser with sample data"""
    
    # Sample CV text
    sample_cv = """
John Smith
Software Engineer
Email: john.smith@email.com
Phone: +1-555-123-4567

SUMMARY
Experienced software engineer with 3 years in web development and cloud technologies.

EDUCATION
BS Computer Science, MIT, 2020
GPA: 3.8/4.0

EXPERIENCE
Software Engineer at Google (Jan 2020 - Present)
- Developed scalable web applications using React and Node.js
- Led a team of 5 developers on cloud migration project
- Reduced system latency by 40% through optimization

Junior Developer at StartupXYZ (2018-2020)
- Built REST APIs using Python and Flask
- Implemented CI/CD pipelines with Jenkins

SKILLS
Python, JavaScript, React, Node.js, AWS, Docker, Git, MySQL

PROJECTS
Personal Portfolio Website
- Built responsive website using React and Tailwind CSS
- Deployed on Vercel with automated CI/CD
- Technologies: React, Tailwind, Vercel

E-commerce Platform
- Full-stack web application with payment integration
- Technologies: Node.js, Express, MongoDB, Stripe API
"""

    # Test the parser
    try:
        print("🧠 Testing Enhanced DeepSeek CV Parser...")
        print("=" * 50)
        
        # Send request to parser
        response = requests.post(
            'http://localhost:6000/parse-cv',
            json={'text': sample_cv},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ CV parsing successful!")
            print("\n📋 Extracted Data:")
            print(json.dumps(result, indent=2))
            
            # Check if key fields were extracted
            print("\n🔍 Validation Results:")
            print(f"Name: {'✅' if result.get('name') else '❌'} {result.get('name', 'Not found')}")
            print(f"Email: {'✅' if result.get('email') else '❌'} {result.get('email', 'Not found')}")
            print(f"Phone: {'✅' if result.get('phone') else '❌'} {result.get('phone', 'Not found')}")
            print(f"Skills: {'✅' if result.get('skills') else '❌'} {len(result.get('skills', []))} skills found")
            print(f"Experience: {'✅' if result.get('experience') else '❌'} {len(result.get('experience', []))} jobs found")
            print(f"Education: {'✅' if result.get('education') else '❌'} {len(result.get('education', []))} degrees found")
            
        else:
            print(f"❌ Error: {response.status_code}")
            print(response.text)
            
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to CV parser service on port 6000")
        print("Make sure the DeepSeek CV parser is running: python deepseek_cv_parser.py")
    except Exception as e:
        print(f"❌ Error: {e}")

def test_health_check():
    """Test the health check endpoint"""
    try:
        response = requests.get('http://localhost:6000/health')
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Health Check: {result['status']} at {result['timestamp']}")
        else:
            print(f"❌ Health Check Failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Health Check Error: {e}")

if __name__ == "__main__":
    print("🚀 PORTMAN DeepSeek CV Parser Test Suite")
    print("=" * 50)
    
    # Test health check first
    test_health_check()
    print()
    
    # Test CV parsing
    test_cv_parser()
    
    print("\n" + "=" * 50)
    print("🏁 Test completed!")
