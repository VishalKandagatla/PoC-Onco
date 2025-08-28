# AI-Powered Tumor Board Report Generation

## Overview
This implementation adds Perplexity AI integration to generate evidence-based tumor board reports with academic citations following WHO guidelines and NCCN standards.

## Key Features Implemented

### 1. Perplexity API Service (`src/services/perplexityReportService.js`)
- **Academic Citation Integration**: Automatically sources from peer-reviewed literature
- **WHO/NCCN Guidelines**: Incorporates current oncology practice standards
- **Contextual Prompting**: Extracts and contextualizes patient data for AI analysis
- **Domain Filtering**: Restricts searches to academic and medical sources
- **Citation Formatting**: Provides proper academic citation format with DOI/PMID

### 2. API Endpoint (`src/routes/reportRoutes.js`)
- **New Endpoint**: `POST /api/reports/generate-perplexity`
- **Database Integration**: Saves AI reports to MongoDB with proper schema
- **Error Handling**: Comprehensive error management for API failures

### 3. UI Integration (`public/patient-dashboard.html`)
- **Report Type Selection**: Toggle between standard and AI-powered reports
- **Loading States**: Visual feedback during AI report generation
- **Citation Display**: Formatted academic citations with relevance scores
- **Professional Formatting**: Print-ready reports with proper medical formatting

## Setup Instructions

### 1. Environment Configuration
```bash
# Create .env file in project root
PERPLEXITY_API_KEY=your_perplexity_api_key_here
PORT=3001
NODE_ENV=development
```

**Important:** The current .env.example contains a sample API key. Replace it with your actual Perplexity API key for testing.

### 2. Get Perplexity API Key
1. Visit [Perplexity API Portal](https://docs.perplexity.ai/)
2. Create account and add payment method
3. Generate API key from API Keys tab
4. Pro subscribers get $5 monthly credits automatically

### 3. Install Dependencies
```bash
npm install axios
```

### 4. Run the Application
```bash
npm run dev
```

## Usage

### Generate AI Report
1. Open patient dashboard
2. Click "Generate Report" button
3. Select "🤖 AI-Powered Tumor Board Report with Academic Citations"
4. Click "Generate Report"
5. Wait 30-60 seconds for AI analysis
6. Review generated report with citations

### Report Features
- **Clinical Context**: Patient demographics, diagnosis, molecular profile
- **Evidence-Based Recommendations**: Treatment options with citation support
- **Academic Citations**: Peer-reviewed sources with DOI/PMID references
- **WHO/NCCN Integration**: Current guideline compliance
- **Clinical Trial Matching**: NCT numbers for relevant trials
- **Quality Assurance**: AI confidence scores and source verification

## Technical Architecture

### Prompt Engineering
The system uses sophisticated prompt engineering to:
- Extract clinical context from patient data
- Format molecular profiles and treatment history
- Request specific citation formats
- Ensure oncology practice standard compliance

### Citation Management
- Automatic relevance scoring
- Source type classification (Peer-reviewed, Guidelines, Clinical Trial, etc.)
- DOI and PMID extraction
- Academic formatting compliance

### Quality Controls
- Peer-reviewed source filtering
- Recency filtering (last 3 years prioritized)
- Academic domain restrictions
- Medical review requirement disclaimers

## Security & Compliance
- API keys secured via environment variables
- Medical disclaimer requirements
- Professional review mandates
- Academic source verification

## Cost Management
- Optimized prompt design to minimize API calls
- Efficient context extraction
- Automatic timeout handling
- Credit usage monitoring recommendations

## Future Enhancements
- PDF export with embedded citations
- Real-time clinical trial API integration
- Multi-language support for global guidelines
- Advanced molecular pathway analysis
- Integration with hospital CDSS systems