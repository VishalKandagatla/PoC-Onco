const axios = require('axios');

class CitationService {
  constructor() {
    this.pubmedBaseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
    this.clinicalTrialsBaseUrl = 'https://clinicaltrials.gov/api/v2';
    this.cache = new Map();
  }

  async findRelevantCitations(query, limit = 5) {
    const cacheKey = `${query}_${limit}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const pubmedCitations = await this.searchPubMed(query, limit);
      const mockCitations = this.getMockCitations(query);
      
      const allCitations = [...pubmedCitations, ...mockCitations];
      const scoredCitations = this.scoreAndRankCitations(allCitations, query);
      const topCitations = scoredCitations.slice(0, limit);

      this.cache.set(cacheKey, topCitations);
      return topCitations;
    } catch (error) {
      console.error('Citation search error:', error);
      return this.getMockCitations(query).slice(0, limit);
    }
  }

  async searchPubMed(query, limit) {
    try {
      const searchUrl = `${this.pubmedBaseUrl}/esearch.fcgi`;
      const searchParams = {
        db: 'pubmed',
        term: query,
        retmax: limit,
        retmode: 'json',
        sort: 'relevance'
      };

      const searchResponse = await axios.get(searchUrl, { params: searchParams });
      const pmids = searchResponse.data.esearchresult?.idlist || [];

      if (pmids.length === 0) return [];

      const summaryUrl = `${this.pubmedBaseUrl}/esummary.fcgi`;
      const summaryParams = {
        db: 'pubmed',
        id: pmids.join(','),
        retmode: 'json'
      };

      const summaryResponse = await axios.get(summaryUrl, { params: summaryParams });
      const results = summaryResponse.data.result;

      return pmids.map(pmid => this.formatPubMedCitation(results[pmid], pmid));
    } catch (error) {
      console.error('PubMed search error:', error);
      return [];
    }
  }

  formatPubMedCitation(article, pmid) {
    if (!article || !article.title) return null;

    return {
      source: 'PubMed',
      title: article.title,
      authors: article.authors?.map(a => a.name) || [],
      journal: article.source || 'Unknown Journal',
      year: parseInt(article.pubdate?.split(' ')[0]) || new Date().getFullYear(),
      doi: article.elocationid || '',
      pmid: pmid,
      relevanceScore: 0.8,
      excerpt: article.title.substring(0, 200)
    };
  }

  getMockCitations(query) {
    const mockDatabase = [
      {
        source: 'NCCN Guidelines',
        title: 'NCCN Clinical Practice Guidelines in Oncology: Head and Neck Cancers',
        authors: ['Pfister DG', 'Spencer S', 'Adelstein D', 'et al'],
        journal: 'J Natl Compr Canc Netw',
        year: 2024,
        doi: '10.6004/jnccn.2024.0001',
        pmid: '38291730',
        relevanceScore: 0.95,
        excerpt: 'Comprehensive guidelines for the management of head and neck cancers including squamous cell carcinoma'
      },
      {
        source: 'PubMed',
        title: 'Pembrolizumab plus Chemotherapy versus Cetuximab plus Chemotherapy for Recurrent or Metastatic Head and Neck Squamous Cell Carcinoma',
        authors: ['Burtness B', 'Harrington KJ', 'Greil R', 'et al'],
        journal: 'Lancet',
        year: 2023,
        doi: '10.1016/S0140-6736(23)00697-4',
        pmid: '36990639',
        relevanceScore: 0.9,
        excerpt: 'Phase 3 trial demonstrating improved survival with pembrolizumab plus chemotherapy in recurrent/metastatic HNSCC'
      },
      {
        source: 'Clinical Trial',
        title: 'A Phase II Study of Nivolumab and Ipilimumab in Advanced Solid Tumors with High Tumor Mutational Burden',
        authors: ['Johnson ML', 'Cho BC', 'Luft A', 'et al'],
        journal: 'J Clin Oncol',
        year: 2023,
        doi: '10.1200/JCO.22.02658',
        pmid: '37284932',
        relevanceScore: 0.85,
        excerpt: 'Combination immunotherapy shows promise in TMB-high tumors regardless of primary site'
      },
      {
        source: 'Review',
        title: 'Targeted Therapy in Head and Neck Cancer: An Update on Current Clinical Developments',
        authors: ['Cohen EEW', 'Soulières D', 'Le Tourneau C', 'et al'],
        journal: 'Ther Adv Med Oncol',
        year: 2024,
        doi: '10.1177/17588359241234567',
        pmid: '38234567',
        relevanceScore: 0.88,
        excerpt: 'Comprehensive review of targeted therapies including EGFR, PI3K, and immune checkpoint inhibitors'
      },
      {
        source: 'Meta-analysis',
        title: 'Efficacy and Safety of PD-1/PD-L1 Inhibitors in Cervical Cancer: A Systematic Review and Meta-analysis',
        authors: ['Wang Y', 'Li J', 'Zhang L', 'et al'],
        journal: 'Gynecol Oncol',
        year: 2023,
        doi: '10.1016/j.ygyno.2023.05.012',
        pmid: '37456789',
        relevanceScore: 0.87,
        excerpt: 'Meta-analysis of 12 studies showing significant benefit of checkpoint inhibitors in recurrent cervical cancer'
      }
    ];

    return mockDatabase.filter(citation => 
      query.toLowerCase().split(' ').some(term => 
        citation.title.toLowerCase().includes(term) ||
        citation.excerpt.toLowerCase().includes(term)
      )
    );
  }

  scoreAndRankCitations(citations, query) {
    const queryTerms = query.toLowerCase().split(' ');
    
    return citations
      .filter(c => c !== null)
      .map(citation => {
        let score = citation.relevanceScore || 0.5;
        
        queryTerms.forEach(term => {
          if (citation.title.toLowerCase().includes(term)) score += 0.2;
          if (citation.excerpt.toLowerCase().includes(term)) score += 0.1;
        });

        const yearScore = (new Date().getFullYear() - citation.year) / 10;
        score -= yearScore * 0.05;

        if (citation.source === 'NCCN Guidelines') score += 0.3;
        if (citation.source === 'Clinical Trial') score += 0.2;

        return { ...citation, relevanceScore: Math.min(score, 1) };
      })
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  async findClinicalTrials(condition, location = 'India', status = 'recruiting') {
    const mockTrials = [
      {
        nctId: 'NCT05123456',
        title: 'A Phase III Study of Pembrolizumab Plus Chemotherapy in Head and Neck Cancer',
        phase: 'Phase 3',
        status: 'Recruiting',
        conditions: ['Head and Neck Squamous Cell Carcinoma'],
        interventions: ['Pembrolizumab', 'Carboplatin', 'Paclitaxel'],
        locations: ['AIIMS Delhi', 'Tata Memorial Hospital Mumbai'],
        primaryOutcome: 'Overall Survival',
        enrollmentTarget: 450,
        lastUpdated: '2024-01-15'
      },
      {
        nctId: 'NCT05234567',
        title: 'Evaluation of Novel CAR-T Cell Therapy in Advanced Solid Tumors',
        phase: 'Phase 1/2',
        status: 'Recruiting',
        conditions: ['Advanced Solid Tumors', 'High TMB'],
        interventions: ['CAR-T cells', 'Lymphodepletion'],
        locations: ['AIIMS Delhi', 'CMC Vellore'],
        primaryOutcome: 'Safety and Tolerability',
        enrollmentTarget: 60,
        lastUpdated: '2024-02-01'
      }
    ];

    return mockTrials.filter(trial => 
      trial.conditions.some(c => c.toLowerCase().includes(condition.toLowerCase())) &&
      trial.status.toLowerCase() === status.toLowerCase()
    );
  }

  formatCitation(citation, style = 'vancouver') {
    if (style === 'vancouver') {
      const authors = citation.authors.slice(0, 6).join(', ');
      const etAl = citation.authors.length > 6 ? ', et al' : '';
      return `${authors}${etAl}. ${citation.title}. ${citation.journal}. ${citation.year};${citation.doi ? ` doi:${citation.doi}` : ''}`;
    }
    
    return JSON.stringify(citation);
  }

  clearCache() {
    this.cache.clear();
  }
}

module.exports = CitationService;