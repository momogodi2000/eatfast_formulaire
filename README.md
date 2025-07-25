# Eat Fast! Newsletter Signup Form

Welcome to the **Eat Fast!** newsletter signup form project. This static HTML form collects user data including email, name, city, role, and food preferences. Since you're hosting it on [Render's free static site tier](https://render.com/docs/static-sites), this project provides multiple backend-free options to handle form submissions securely and effectively.

---

## 🚀 Features

- Clean and responsive newsletter signup form
- Collects: Email, Role, Name, City, Preferences
- Works without a backend server
- Options for data storage:
  - Google Sheets (recommended)
  - Formspree
  - Netlify Forms (for Netlify users)

---

## ✅ Setup Options

### 🥇 Option 1: Google Sheets (Recommended)

Store form data directly in a Google Sheet using Google Apps Script.

#### 1. Create a Google Sheet
- Add columns: `Email`, `Role`, `Nom`, `Ville`, `Preferences`, `Timestamp`

#### 2. Add Google Apps Script
- In your Sheet: `Extensions > Apps Script`
- Replace the default code with the script below (you will paste your actual code here)

#### 3. Deploy as Web App
- Go to `Deploy > New deployment`
- Select type: **Web App**
- Set:
  - Execute as: **Me**
  - Access: **Anyone**
- Click `Deploy` and copy the Web App URL

#### 4. Update Your HTML Form
In your HTML JavaScript, send a POST request to your Web App URL:

```javascript
const scriptURL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';
const form = document.forms['eatFastForm'];

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  await fetch(scriptURL, { method: 'POST', body: formData });
  alert('Merci pour votre inscription !');
});

🥈 Option 2: Formspree (Quick Setup)
Use Formspree's form endpoint to collect submissions.

Steps:
Sign up at Formspree.io

Create a new form and copy your endpoint URL

Replace your form's fetch call like this:

javascript
Copy
Edit
await fetch('https://formspree.io/f/YOUR_FORM_ID', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
});
🥉 Option 3: Netlify Forms (If Hosting on Netlify)
If you host on Netlify, enable its native form handling.

In your HTML:
html
Copy
Edit
<form netlify name="eat-fast-newsletter" id="eatFastForm">
📌 Ensure you include name attributes on all form inputs.

📤 Deploying to Render.com
Push your HTML file (index.html) to a GitHub repository

Go to Render.com

Create a Static Site:

Connect your GitHub repo

Leave the Build command empty

Leave Publish directory as . or empty

📌 Notes
🔁 Replace Placeholder URLs: Insert your actual Google Script or Formspree endpoint

⚠️ CORS: Handled automatically by Google Apps Script

🔒 Privacy: Make sure to include a privacy policy to inform users about data collection

📊 Google Quotas: Free tier limits are generous for typical newsletter use

🧠 Why Google Sheets?
Free, reliable, and easy to maintain

Perfect for small-to-medium scale signups

Simple export and analysis

No server or DB setup needed

📂 Project Structure
graphql
Copy
Edit
eat-fast-newsletter/
├── index.html         # Main newsletter signup page
├── style.css          # Optional: your CSS styles
└── README.md          # You’re here!