# R Territory AI Predictive Insights Engine

A complete end-to-end platform for territory management with AI-driven predictive analytics, real-time data sync, and GIS mapping.

## 🚀 Features

### Core Functionality
- **Territory Management**: Create, update, and manage territories with GIS polygon data
- **AI Predictive Analytics**: Machine learning-based price appreciation predictions (0-25% range)
- **Real-Time Sync**: WebSocket-based live data synchronization across devices
- **Interactive Maps**: OpenStreetMap + Leaflet integration with color-coded territories
- **Data Gathering**: Community-driven data collection forms for live insights
- **Comment System**: AI-validated community feedback (Regex + OpenAI GPT-5 toggle)
- **RBAC**: Role-based access control (Admin, Manager, Viewer, Community Head)
- **Analytics Dashboard**: Historical trends, charts, and comprehensive metrics

## 🛠️ Tech Stack

**Backend**: FastAPI (Python) + MongoDB + JWT Auth + OpenAI GPT-5  
**Frontend**: React 19 + Shadcn UI + Leaflet + Recharts + Framer Motion  
**Real-Time**: WebSocket for multi-device sync  

## 📊 System Highlights

- **9 Territory Metrics**: Investments, Buildings, Population, Quality, Infrastructure, Livability, Pollution, Roads, Crime
- **AI Predictions**: Appreciation %, Demand Pressure, Confidence Score
- **Dual Validation**: Comments validated via Regex or AI (toggleable)
- **Live Dashboard**: Stats, top territories, appreciation trends
- **GIS Mapping**: Interactive polygons with popup details

## 🚀 Quick Start

### Default Credentials
```
Email: admin@rterritory.com
Password: admin123
Role: admin
```

### Test the System
```bash
# API is live at: /api
# Test all features via UI or API calls
```

## 📱 Main Pages

1. **Dashboard**: Overview stats, top territories table
2. **Territory Map**: Interactive GIS visualization with Leaflet
3. **Data Gathering**: Live data collection forms
4. **Analytics**: Charts, trends, detailed metrics
5. **Comments**: AI-validated community feedback

## 🤖 AI Features

- **Price Prediction**: Weighted formula with 7 factors
- **Comment Validation**: GPT-5 powered content moderation
- **Confidence Scoring**: 70-95% reliability metrics

## 🔐 User Roles

- **Admin**: Full CRUD + delete
- **Manager**: Create/update + moderate
- **Community Head**: Limited management
- **Viewer**: Read-only

## 🌐 Architecture

- Backend on port 8001 (supervised)
- Frontend on port 3000 (hot reload)
- MongoDB local instance
- WebSocket on /ws endpoint
- All routes prefixed with /api

## 📈 Data Flow

1. User submits metrics → Backend calculates AI insights
2. Territory stored in MongoDB with predictions
3. WebSocket broadcasts update to all clients
4. Historical data saved for trend analysis
5. Charts updated in real-time

## ✅ Features Implemented

✓ Complete authentication system with JWT  
✓ Territory CRUD with GIS coordinates  
✓ AI price appreciation predictor  
✓ OpenStreetMap integration  
✓ Real-time WebSocket sync  
✓ Data gathering forms  
✓ Comment validation (dual-mode)  
✓ Analytics dashboard with charts  
✓ RBAC with 4 roles  
✓ Historical metrics tracking  
✓ Responsive UI with Shadcn components  

---

**Production-Ready MVP Built with Emergent AI Platform**
