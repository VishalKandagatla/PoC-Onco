# Entheory Medical AI PoC - Comprehensive Healthcare Platform

## 🏥 Overview
A complete AI-powered medical platform that demonstrates comprehensive patient management, medical search with AI, tumor board reports, and healthcare analytics for oncology care.

## ✨ Key Features Implemented

### 🎯 **Core Functionality**
- **📋 Clinician Dashboard**: Patient overview with comprehensive metadata
- **👤 Patient Profiles**: 7-tab detailed patient history system
- **🔍 Medical Search**: Perplexity AI-powered medical knowledge search
- **📊 Tumor Board Reports**: Individual patient oncology reports
- **📈 Analytics Dashboard**: Hospital administration metrics
- **🧬 Molecular Profiles**: Genetic testing and biomarker analysis
- **💊 Treatment Response**: Treatment timeline and side effects tracking

### 🚀 **Quick Start (Recommended)**

**Option 1: Use the startup script**
```bash
./start.sh
```

**Option 2: Manual startup**
```bash
npm install
npm run dev
```

The application will start on **http://localhost:3001** and automatically open the clinician dashboard.

## 🎨 **Application Pages**

| Page | URL | Description |
|------|-----|-------------|
| **Clinician Dashboard** | `http://localhost:3001` | Main patient overview with comprehensive metadata |
| **Medical Search** | `http://localhost:3001/medical-search.html` | AI-powered medical knowledge search |
| **Patient Detail** | `http://localhost:3001/patient-detail.html?id=CASE_ID` | Complete patient history (7 tabs) |
| **Analytics** | `http://localhost:3001/analytics.html` | Hospital administration dashboard |
| **Tumor Board Reports** | `http://localhost:3001/tumor-board-reports.html` | Individual patient reports |

## 👥 **Patient Cases Available**
- **SYNTHETIC-CASE_1**: Rajesh Kumar - Oral Squamous Cell Carcinoma (T2N1M0)
- **SYNTHETIC-CASE_2**: Lakshmi Devi - Cervical Carcinoma (Stage IIIB) 
- **SYNTHETIC-CASE_3**: Rina Saha - Breast Carcinoma (Stage IIA)

## 📱 **Complete Feature Set**

### **1. Clinician Dashboard**
- Patient cards with comprehensive clinical indicators
- Key biomarkers display (PD-L1, HPV-16, etc.)
- Treatment summary with latest response
- Recent timeline activities (diagnosis-specific)
- Click patient → Overview modal → "View Complete History"

### **2. Patient Detail Pages (7 Tabs)**
- 🕐 **Timeline**: Longitudinal care history
- 📋 **Medical History**: Chief complaint, past/family/social history
- 🧪 **Lab Results**: Laboratory values with normal ranges
- 🏥 **Imaging**: Medical images with findings
- 🧬 **Genomics**: Germline genetics, somatic mutations, CNVs, MSI/TMB, pharmacogenomics
- ⚛️ **Molecular Profile**: Genetic testing, biomarkers, immunohistochemistry
- 💊 **Treatment Response**: Treatment responses, side effects, performance status

### **3. Medical Search (Perplexity AI)**
- Patient context selection (CASE_1, CASE_2, CASE_3)
- Dynamic source generation based on search terms
- Academic citation integration with DOI/PMID
- Search history with patient-specific context
- "Chain of thought" search process visualization

### **4. Tumor Board Reports**
- Individual reports for each patient case
- Indian doctor names (Dr. Priya Sharma, Dr. Rajesh Gupta, etc.)
- Status tracking (Draft, Ready, Presented, Archived)
- Report generation and editing capabilities

### **5. Analytics Dashboard**
- Hospital administration metrics
- Patient flow analysis
- Treatment outcome statistics
- Resource utilization tracking

## 🛠 **Technical Architecture**

### **Frontend Stack**
- **Vanilla JavaScript** - Modular component architecture
- **HTML5/CSS3** - Responsive design with Tailwind CSS
- **Font Awesome** - Icon system
- **Liquid Glass Morphism** - Modern UI effects

### **Backend Stack**
- **Node.js + Express** - Server framework
- **File-based Data** - No MongoDB required
- **Modular Services** - PatientService, Navigation, Components

### **Data Management**
- **Shared Data Source** (`patientData.js`) - Centralized patient information
- **Service Layer** - Consistent data operations
- **Component System** - Reusable UI components

## 🔧 **Development Setup**

### **Prerequisites**
- Node.js (v14 or higher)
- npm package manager

### **Installation**
```bash
# Clone and navigate to project
cd /Users/vishalkandagatla/Entheory/PoC

# Install dependencies
npm install

# Start development server
npm run dev
# OR use the startup script
./start.sh
```

### **Environment Configuration**
Create `.env` file with:
```bash
PERPLEXITY_API_KEY=your_perplexity_api_key_here
PORT=3001
NODE_ENV=development
```

## 📁 **File Structure**
```
PoC/
├── public/                          # Frontend files
│   ├── css/                        # Stylesheets
│   ├── js/                         # JavaScript modules
│   ├── images/                     # Assets and logos
│   ├── patients/                   # Patient-specific images
│   ├── clinician-dashboard.html    # Main dashboard
│   ├── patient-detail.html         # Patient profiles
│   ├── medical-search.html         # AI search interface
│   ├── analytics.html              # Analytics dashboard
│   └── tumor-board-reports.html    # Reports page
├── src/                            # Backend services
├── start.sh                        # Startup script
└── README.md                       # This file
```

## 🎯 **Key Achievements**

### **✅ All Issues Resolved**
- ✅ Modal popups fixed (no automatic opening)
- ✅ Timeline events show meaningful activities instead of "Unknown Event"
- ✅ Molecular Profile and Treatment Response tabs fully functional
- ✅ Indian doctor names throughout the application
- ✅ toLowerCase errors completely resolved
- ✅ All 7 patient detail tabs rendering properly

### **✅ Complete Patient Data Integration**
- ✅ Comprehensive genomics data (5 sections)
- ✅ Molecular profiles with genetic testing
- ✅ Treatment response tracking
- ✅ Medical imaging with patient-specific folders
- ✅ Laboratory results with normal ranges
- ✅ Timeline activities based on cancer type

### **✅ AI-Powered Features**
- ✅ Perplexity API integration for medical search
- ✅ Patient context-aware search results
- ✅ Academic citation formatting
- ✅ Dynamic source generation
- ✅ Evidence-based recommendations

## 🚀 **Usage Instructions**

1. **Start the Application**:
   ```bash
   ./start.sh
   ```

2. **Main Dashboard**: Opens automatically at `http://localhost:3001`

3. **Explore Patient Data**:
   - Click any patient card
   - View comprehensive overview modal
   - Click "View Complete History" for detailed 7-tab view

4. **Try Medical Search**:
   - Navigate to Medical Search from top menu
   - Select patient context (CASE_1, CASE_2, or CASE_3)
   - Search medical topics with AI assistance

5. **Review Reports**:
   - Go to Reports section
   - View tumor board reports for each patient
   - See Indian doctor names and comprehensive summaries

## 🎉 **What Makes This Special**

### **Medical Accuracy**
- Real oncology data structures
- WHO/NCCN guideline compliance
- Clinical pathway alignment
- Evidence-based recommendations

### **User Experience**
- Minimalist, professional design
- Intuitive navigation
- Responsive layout
- Error-free operation

### **Technical Excellence**
- Modular architecture
- Consistent data management
- Proper error handling
- Performance optimization

## 📞 **Support**

This PoC demonstrates a complete medical AI platform suitable for:
- Hospital administration demos
- Investor presentations
- Technical architecture reviews
- Healthcare innovation showcases

The application runs entirely locally without external dependencies (except Perplexity API for search).

---

**🏥 Built with ❤️ for healthcare innovation in India**