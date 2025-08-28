# 🏥 Entheory Medical AI PoC - Setup Guide

## 🚀 Quick Start (Any IDE/Environment)

### **1. Prerequisites**
- Node.js (v14 or higher)
- npm (comes with Node.js)

### **2. Installation**
```bash
# Navigate to project directory
cd PoC

# Install dependencies
npm install
```

### **3. Environment Setup**
```bash
# Copy environment file
cp .env.example .env

# Edit .env file if needed (optional)
# Default settings work perfectly
```

### **4. Start Application**

**Option A: Using startup script (recommended)**
```bash
./start.sh
```

**Option B: Using npm commands**
```bash
npm run dev
# OR
npm start
```

### **5. Access Application**
The app automatically opens at: **http://localhost:3001**

---

## 📋 IDE-Specific Setup

### **VS Code**
1. Open project folder
2. Install recommended extensions (if prompted)
3. Use integrated terminal: `npm run dev`

### **WebStorm/IntelliJ**
1. Open project folder
2. WebStorm will auto-detect Node.js project
3. Run configuration: `npm run dev`

### **Atom/Sublime Text**
1. Open project folder
2. Use terminal: `npm run dev`

### **Any Terminal/Command Line**
```bash
cd PoC
npm install
npm run dev
```

---

## 🔧 Troubleshooting

### **Port Already in Use**
```bash
# Kill existing process
lsof -ti:3001 | xargs kill -9

# Or use different port
PORT=3002 npm run dev
```

### **Dependencies Issues**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### **Permission Issues (Unix/Mac)**
```bash
# Make startup script executable
chmod +x start.sh
```

---

## 📁 What You Get

- **Main Dashboard**: Patient overview with comprehensive metadata
- **Medical Search**: AI-powered knowledge search with Perplexity
- **Patient Profiles**: 7-tab detailed patient history
- **Reports**: Tumor board reports with Indian doctor names
- **Analytics**: Hospital administration dashboard

---

## ✅ Verification

After startup, verify these URLs work:
- http://localhost:3001 (Main Dashboard)
- http://localhost:3001/medical-search.html
- http://localhost:3001/analytics.html
- http://localhost:3001/tumor-board-reports.html

---

## 🎯 Success Indicators

✅ Server starts without errors
✅ No console errors in browser
✅ All patient data loads properly
✅ No modal popups appear automatically
✅ All 7 patient tabs work correctly
✅ Medical search functions with AI
✅ Indian doctor names appear in reports

---

**🏥 Ready to demo healthcare innovation!**