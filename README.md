# 🏪 Store AutoSys (Система автоматизації роботи магазину)

A lightweight, lightning-fast Point of Sale (POS) and inventory management dashboard built for modern retail. 

Store AutoSys is designed to eliminate manual tracking, speed up checkout times, and provide a single source of truth for store operations. This project currently implements a robust Minimum Viable Product (MVP) focusing on core transaction and catalogue mechanics, with an architecture designed to scale into enterprise-level automation.

---

## 🛠️ Tech Stack

**Frontend:**
* **Vue 3 (Composition API):** Built as a lightweight, buildless Single Page Application (SPA) for maximum speed and zero-configuration deployment.
* **Bootstrap 5:** For clean, responsive, and accessible UI components.
* **Vue Router:** For seamless, instant client-side navigation.

**Backend:**
* **FastAPI (Python):** High-performance backend framework for serving the RESTful API.
* **SQLModel:** Combines SQLAlchemy and Pydantic for unified data validation and database models.
* **SQLite:** Zero-setup, file-based relational database perfect for local deployments and coursework portability.

---

## ✨ Current Features (MVP Version 1.0)

* **Real-time Inventory Catalogue:** Full CRUD capabilities for store managers to add, update, and delete products. Includes SKU tracking and visual low-stock warnings.
* **Point of Sale (POS) Terminal:** A fast, grid-based checkout screen for cashiers. Includes dynamic cart calculation, stock-limit prevention, and one-click checkout.
* **Automated Stock Deduction:** Completing a sale via the POS instantly and accurately deducts the purchased quantities from the central inventory database.
* **Transaction History:** Immutable logging of all sales, generating receipts with timestamps, itemized summaries, and revenue totals.

---

## 🚀 Roadmap: Core Features To Implement (Phase 2)

As the system scales, the following enterprise features are slated for development:

- [ ] **Advanced Inventory Management:** Automated systems to track stock levels dynamically, generate purchase orders automatically, and monitor inventory movement to prevent stockouts.
- [ ] **Cloud POS Integrations:** Synchronization with third-party cloud-based systems (like Lightspeed or Square) to handle multi-channel transactions, sync online/offline sales, and manage customer loyalty programs.
- [ ] **Automated Checkout & Pricing:** Integration with self-checkout kiosks and Electronic Shelf Labels (ESLs) to update prices instantly across the physical store and reduce checkout lines.
- [ ] **Data Analytics:** Implementation of machine learning tools to analyze buying patterns, optimize product assortments, and suggest layout improvements.
- [ ] **Staff & Operations Management:** Role-Based Access Control (RBAC) and systems to automate payroll (via services like SurePayroll) and optimize employee scheduling.

---

## 💻 Getting Started (Local Development)

Because this project utilizes a lightweight architecture, getting it running locally takes less than two minutes.

### 1. Start the Backend (FastAPI)

Open your terminal, navigate to the `backend` directory, and run the following commands:

```bash
# Create a virtual environment
python -m venv venv

# Activate the environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install fastapi uvicorn sqlmodel

# Start the server
uvicorn main:app --reload
```

The API will now be running at `http://127.0.0.1:8000`. The SQLite database (`store.db`) will be automatically generated on the first run.

### 2. Start the Frontend (Vue 3)

Open a new terminal window, navigate to the frontend directory, and start a local web server.

Using NPX (Recommended for live-reloading):
```bash
npx live-server --port=8080
```

Alternatively, using Python's built-in server:
```bash
python -m http.server 8080
```

Open your browser and navigate to `http://localhost:8080` to access the POS Dashboard.
