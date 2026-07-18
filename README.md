# Mahima Agro Farms — Admin Portal

A secure admin dashboard for managing the Mahima Agro Farms website content including media uploads, grower registrations, blog posts, and analytics.

---

## 🚀 How to Run the Admin Portal Locally

### Requirements
- Python 3.7+

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/ARKOTMITESH/agrifarms.git
cd agrifarms

# 2. Start the server
python server.py

# 3. Open in browser
# Visit: http://localhost:8000/admin.html
```

### Login
- **Password:** `mahima2026`

---

## 📋 Admin Portal Features

| Feature | Description |
|---------|-------------|
| 🔐 Secure Login | Passcode-protected access |
| 📸 Upload Media | Upload Photos, Videos, PDFs linked to growers |
| 👨‍🌾 Grower Management | Register, view, and delete growers |
| 📊 Analytics Charts | Land distribution pie chart & media bar chart |
| 📥 CSV Export | Download grower data as CSV report |
| 📝 Blog Management | Add and delete blog posts |
| 🗑️ Delete Assets | Remove uploaded media files |

---

## 📁 Folder Structure

```
agrifarms/
├── admin.html          ← Admin portal page
├── server.py           ← Python backend API server
├── index.html          ← Main website homepage
├── about.html
├── contact.html
├── growers.html
├── gallery.html
├── blog.html
├── product.html
├── service.html
├── css/                ← Stylesheets
├── js/                 ← JavaScript files
├── lib/                ← Third-party libraries
├── img/                ← Images
├── data/               ← JSON databases
│   ├── growers.json    ← Registered growers
│   ├── media.json      ← Uploaded media records
│   └── blogs.json      ← Blog posts
└── uploads/            ← Uploaded files storage
    ├── images/
    ├── videos/
    └── pdfs/
```

---

## 🌐 Live Website

**Domain:** [mahimaagrofarms.com](https://mahimaagrofarms.com)

> ⚠️ **Note:** The admin portal backend (`server.py`) runs locally only. Cloudflare Pages hosts the static website. Run `python server.py` on your local machine to use the admin panel.

---

## 📞 Contact

**Mahima Agro Farms**  
1st Floor, 26/680, Revenue Ward 26-1,  
Bhaktha Vatsala Nagar, Nellore,  
Sri Potti Sriramulu Nellore District,  
Andhra Pradesh – 524004  

📞 +91 93817 06785  
📧 mahimaagrofarm@gmail.com
