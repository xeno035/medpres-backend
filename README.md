# 🩺 MedPres – Digital Prescription Verification System

**MedPres** is a full-stack web application built to ensure the authenticity of medical prescriptions and to help prevent prescription fraud. It enables registered doctors to generate prescriptions digitally, which pharmacists can then verify through a secure platform using a unique prescription ID.

---

## 🔧 Tech Stack

| Layer       | Technology          |
|-------------|---------------------|
| Frontend    | React.js, Tailwind CSS |
| Backend     | Node.js, Express.js |
| Database    | SQLite *(upgradeable to MongoDB/PostgreSQL)* |
| Auth/Security | Environment Variables, Future JWT |
| Deployment | *(Coming soon)* Cloud or Localhost |

---

## ✨ Features

- ✅ **Doctor Login & Prescription Creation**  
  Doctors can securely log in and create prescriptions with patient and medicine details.

- ✅ **Unique Prescription ID Generator**  
  Each prescription receives a unique, traceable ID for verification.

- ✅ **Pharmacist Verification Panel**  
  Pharmacists can search prescriptions by ID and verify legitimacy before issuing medicine.

- ✅ **Secure and Scalable Architecture**  
  Backend built with best practices using Express and SQLite; supports future migration to more robust databases.

- ✅ **Clean and Interactive UI**  
  Responsive React interface for both doctors and pharmacists with smooth navigation.

---

## 🚀 Getting Started

### 1️⃣ Clone the Repo
```bash
git clone https://github.com/your-username/medpres.git
cd medpres



 Install Dependencies
bash
Copy
Edit
npm install
# or
yarn
3️⃣ Start the Application
bash
Copy
Edit
# For frontend
cd client
npm start

# For backend
cd server
npm start

