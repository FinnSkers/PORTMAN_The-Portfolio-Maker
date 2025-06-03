# PORTMAN: The Portfolio Maker

## PORTMAN: CV-to-Dynamic-Website Generator

PORTMAN is a modern, open-source system that transforms a user's CV into a dynamic, multi-page, and responsive website using AI and modern web technologies. This project is fully dynamic, scalable, and extensible, with a focus on user experience, accessibility, and future enhancements.

---

### 📁 Project Structure
- `backend/` — Node.js/Express and Python microservices for API, CV parsing, and AI
- `frontend/` — Next.js/React app for user interface
- `docs/` — Documentation and architecture diagrams
- `tests/` — Automated tests
- `scripts/` — Deployment and utility scripts
- `PROJECT_STRUCTURE.md` — Overview of the folder structure
- `README.md` — Project-specific overview
- `package.json` — Node.js dependencies and scripts
- `backend/requirements.txt` — Python dependencies

---

### 🚀 Key Features
- Secure user onboarding and CV upload (PDF, DOCX, TXT)
- AI/NLP-powered CV parsing and data extraction
- Automated, customizable website generation
- Modular, dynamic components (not static pages)
- Modern, responsive, and accessible design
- Drag-and-drop and inline editing for personalization
- CMS integration, authentication, real-time database, and dynamic forms
- Automated testing, CI/CD, and free-tier deployment (Vercel, Netlify)
- User dashboard for site management, analytics, and feedback
- Continuous improvement via feedback loops

---

### 🛠️ System Architecture
- **Frontend:** Next.js (React), Tailwind CSS or Material-UI
- **Backend:** Node.js/Express, Python microservices (spaCy, pdf-parse, mammoth, OpenAI API)
- **Database:** MongoDB Atlas or PostgreSQL (free tier)
- **Authentication:** OAuth/JWT, Firebase Auth, or similar
- **CMS:** Strapi, Contentful, or Notion API (optional)
- **Deployment:** Vercel/Netlify (free tier), GitHub Actions for CI/CD

---

### 🔄 Workflow Overview
1. User registers and completes onboarding (preferences survey)
2. User uploads CV (PDF/DOCX/TXT)
3. Backend parses and extracts data using AI/NLP
4. User reviews and confirms extracted data
5. AI generates a design brief and matches a template
6. User customizes the design (drag-and-drop, inline editing)
7. System generates a dynamic, multi-page website
8. User manages site, analytics, and feedback via dashboard

---

### 🗺️ Roadmap & Future Enhancements
- **Phase 1:** MVP (CV upload, NLP extraction, basic website generation)
- **Phase 2:** Dynamic features (CMS, authentication, real-time DB, forms)
- **Phase 3:** Modern enhancements (PWA, dark mode, advanced analytics)
- **Phase 4:** Scalability & collaboration (real-time editing, multi-language)
- **Phase 5:** Community & marketing (docs, tutorials, open-source engagement)

---

### 🔗 Similar Projects & References
- [JSON Resume](https://jsonresume.org/)
- [Reactive Resume](https://rxresu.me/)
- [Resumake](https://resumake.io/)
- [VisualCV](https://www.visualcv.com/)

### 🌐 Online Resources & Inspiration
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Guides](https://vercel.com/guides)
- [Netlify Docs](https://docs.netlify.com/)
- [OpenAI API](https://platform.openai.com/docs)
- [spaCy NLP](https://spacy.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Material-UI](https://mui.com/)
- [Strapi CMS](https://strapi.io/)

---

### 🏁 Getting Started

#### Backend
1. Install dependencies:
   ```sh
   cd backend
   npm install express cors multer pdf-parse
   ```
2. Start the backend server:
   ```sh
   node server.js
   ```

#### Frontend
1. Install dependencies:
   ```sh
   cd frontend
   npm install
   ```
2. Start the frontend:
   ```sh
   npm run dev
   ```

#### Testing
- See `tests/` for example tests.

---
For more details, see the full architecture report in `CV-to-Dynamic-Website-Generator-Report.txt.txt` and the documentation in `docs/`.