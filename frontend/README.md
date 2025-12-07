# 📝 AI Text Summarizer App

A full-stack web application that allows users to **register, login, and generate text summaries** (both extractive and abstractive) with optional **bullet points**. Users can **download summaries**, view them in a **dashboard**, and manage their data securely.

---

## 🚀 Features
- 🔐 JWT-based Authentication (Register/Login)
- 📑 Extractive & Abstractive Text Summarization
- 📝 Bullet Points Generation
- 💾 Save Summaries in MySQL Database
- 📥 Download Summaries as `.txt`
- 📊 Dashboard to view & delete summaries
- 🌗 Dark/Light Mode Toggle
- 🎨 Modern React UI (Material-UI components)

---

## 🛠️ Technologies Used

### Backend
- **Flask** (Python web framework)
- **PyMySQL** (MySQL database driver)
- **Flask-JWT-Extended** (JWT authentication)
- **Flask-CORS** (cross-origin requests)
- **bcrypt** (password hashing)
- **HuggingFace Transformers** (abstractive summarization with `t5-small`)
- **NLTK** (extractive summarization, sentence tokenization)

### Frontend
- **React** (SPA frontend)
- **React Router v6** (navigation)
- **Material-UI (MUI)** (UI components)
- **Axios** (API calls)

### Database
- **MySQL 8+**

---

## 📂 Project Structure

```
ai-summarizer-app/
│
├── backend/
│   └── server.py         # Flask backend (API + JWT + DB + Summarizer)
│
├── frontend/
│   ├── App.js            # React Router setup
│   ├── Home.js           # Summarizer page
│   ├── Dashboard.js      # Dashboard for summaries
│   ├── DownloadSummary.js# Download summaries page
│   ├── Login.js          # Login form
│   ├── Register.js       # Signup form
│   └── ProtectedRoute.js # Route guard for JWT auth
│
└── README.md             # Project documentation
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/yourusername/ai-summarizer-app.git
cd ai-summarizer-app
```

### 2️⃣ Setup Backend (Flask)
```bash
cd backend

# create virtual environment
python -m venv venv
source venv/bin/activate   # Linux/macOS
venv\Scripts\activate      # Windows

# install dependencies
pip install flask flask-jwt-extended flask-cors pymysql bcrypt nltk transformers torch sentencepiece
```

Run the server:
```bash
python server.py
```
Backend will run on **http://localhost:5000**

---

### 3️⃣ Setup Database (MySQL)

Run these SQL queries:

```sql
CREATE DATABASE demo;
USE demo;

-- users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- summaries table
CREATE TABLE summaries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meet_id INT NOT NULL,
    user_email VARCHAR(150) NOT NULL,
    ptext TEXT NOT NULL,
    summary TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_meeting (meet_id, user_email)
);

-- bullet_points table
CREATE TABLE bullet_points (
    id INT AUTO_INCREMENT PRIMARY KEY,
    meet_id INT NOT NULL,
    user_email VARCHAR(150) NOT NULL,
    ptext TEXT NOT NULL,
    bullets TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### 4️⃣ Setup Frontend (React)
```bash
cd frontend

# install dependencies
npm install

# start dev server
npm start
```

Frontend will run on **http://localhost:3000**

---

## 🔑 Usage Flow
1. Register a new account `/register`
2. Login to get a **JWT token** (stored in `localStorage`)
3. Generate summaries on `/home`
4. Download or save bullet points
5. View/delete saved summaries in `/dashboard`

---

## 📦 Example API Calls (via `curl`)

**Register**
```bash
curl -X POST http://127.0.0.1:5000/register \
-H "Content-Type: application/json" \
-d '{"username":"test","email":"test@example.com","password":"12345"}'
```

**Login**
```bash
curl -X POST http://127.0.0.1:5000/login \
-H "Content-Type: application/json" \
-d '{"email":"test@example.com","password":"12345"}'
```

**Generate Summary**
```bash
curl -X POST http://127.0.0.1:5000/get_summary \
-H "Authorization: Bearer <TOKEN>" \
-H "Content-Type: application/json" \
-d '{"text":"Long text here...", "meeting_id":1, "type":"abstractive", "generate_bullets": true}'
```

---

## ✅ Future Improvements
- Export summaries as PDF/Word
- Add user profile & preferences
- Deploy backend on **AWS/Render** and frontend on **Vercel/Netlify**
- Improve abstractive summarizer with custom fine-tuning
