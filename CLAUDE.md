# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Vehicle-Checking — ระบบตรวจเช็คยานพาหนะสำหรับโรงพยาบาล SEMed ประกอบด้วยฟอร์มตรวจเช็ค 20 รายการ, Export Excel/PDF, Activity Log

## Architecture

- **Frontend**: Vue 3 + Vite (port 3099) — `frontend/`
- **Backend**: Express.js (port 8099) — `backend/`
- **ORM**: Prisma — `backend/prisma/schema.prisma`
- **Database**: PostgreSQL (`vehicle_checking`)

## Development Commands

```bash
# Backend
cd backend
npm install
npx prisma migrate dev       # Run migrations
npx prisma generate          # Generate Prisma client
node prisma/seed.js           # Seed sample data
npm run dev                   # Start with nodemon

# Frontend
cd frontend
npm install
npm run dev                   # Vite dev server on port 3099
```

## Key Files

- `backend/src/index.js` — Express entry point (binds 0.0.0.0:8099)
- `backend/src/routes/` — API routes (auth, vehicles, inspections, users, logs, export)
- `backend/src/services/inspectionItems.js` — 20 inspection items matching the SEMed form
- `backend/src/images/` — Logo.png and SGSISO.jpg used in exports
- `backend/prisma/schema.prisma` — User, Vehicle, Inspection, InspectionDetail, ActivityLog
- `frontend/src/router/index.js` — Vue Router with auth guard
- `frontend/src/stores/api.js` — Axios instance, uses `window.location.hostname` for IP access
- `frontend/src/views/` — All page components

## Auth Model

Simple phone-based: Register with username + phone, Login with phone only. No JWT/sessions — user object stored in localStorage.

## Database

Connection via `backend/.env` — `DATABASE_URL="postgresql://postgres:CPE64mut!@localhost:5432/vehicle_checking?schema=public"`

## Export

Excel (ExcelJS) and PDF (PDFKit) export monthly inspection data per vehicle, including SEMed Logo (top-left) and SGS ISO/UKAS badge (top-right).
