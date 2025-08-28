import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<MedicalDashboard />} />
        </Routes>
      </div>
    </Router>
  );
};

const MedicalDashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-4">🏥 Entheory Medical AI PoC</h1>
        <p className="text-muted-foreground">Healthcare Data Interoperability Platform</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Clinician Dashboard"
          description="Patient overview with comprehensive metadata"
          href="/clinician-dashboard.html"
          icon="👨‍⚕️"
        />
        <DashboardCard
          title="Medical Search"
          description="AI-powered knowledge search with Perplexity"
          href="/medical-search.html"
          icon="🔍"
        />
        <DashboardCard
          title="Patient Profiles"
          description="7-tab detailed patient history"
          href="/patient-detail.html"
          icon="📋"
        />
        <DashboardCard
          title="Tumor Board Reports"
          description="Generate comprehensive medical reports"
          href="/tumor-board-reports.html"
          icon="📑"
        />
        <DashboardCard
          title="Hospital Analytics"
          description="Administration dashboard with insights"
          href="/hospital-analytics.html"
          icon="📊"
        />
        <DashboardCard
          title="API Documentation"
          description="Explore available endpoints"
          href="/api/health"
          icon="🔧"
        />
      </div>
      
      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          ✅ Server running on port 3001 | ✅ File-based data service active | ✅ All systems operational
        </p>
      </div>
    </div>
  );
};

const DashboardCard = ({ title, description, href, icon }) => {
  const handleClick = () => {
    window.open(href, '_blank');
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-card border border-border rounded-lg p-6 cursor-pointer hover:bg-accent transition-colors duration-200 hover:shadow-lg"
    >
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
      <div className="mt-4 text-primary text-sm font-medium">
        Click to open →
      </div>
    </div>
  );
};

export default App;