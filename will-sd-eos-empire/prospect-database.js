/**
 * South Dakota EOS Prospect Database System
 * Target: $2M+ revenue companies, 10-50+ employees, growth challenges
 */

class SDEOSProspectDatabase {
  constructor() {
    this.prospects = [];
    this.qualificationCriteria = {
      minRevenue: 2000000, // $2M minimum
      minEmployees: 10,
      maxEmployees: 250,
      targetIndustries: [
        'Manufacturing',
        'Construction', 
        'Professional Services',
        'Healthcare',
        'Technology',
        'Agriculture',
        'Financial Services'
      ]
    };
  }

  /**
   * Score prospect for EOS fit (1-10 scale)
   */
  scoreProspect(prospect) {
    let score = 0;

    // Revenue scoring (0-3 points)
    if (prospect.revenue >= 20000000) score += 3; // $20M+
    else if (prospect.revenue >= 10000000) score += 2.5; // $10M+
    else if (prospect.revenue >= 5000000) score += 2; // $5M+
    else if (prospect.revenue >= 2000000) score += 1.5; // $2M+

    // Employee count scoring (0-2 points)
    if (prospect.employees >= 50) score += 2;
    else if (prospect.employees >= 25) score += 1.5;
    else if (prospect.employees >= 15) score += 1;
    else if (prospect.employees >= 10) score += 0.5;

    // Industry fit scoring (0-2 points)
    const highFitIndustries = ['Manufacturing', 'Construction', 'Professional Services'];
    if (highFitIndustries.includes(prospect.industry)) score += 2;
    else if (this.qualificationCriteria.targetIndustries.includes(prospect.industry)) score += 1;

    // Growth indicators (0-2 points)
    if (prospect.growthIndicators) {
      if (prospect.growthIndicators.includes('rapid_expansion')) score += 0.7;
      if (prospect.growthIndicators.includes('multiple_locations')) score += 0.7;
      if (prospect.growthIndicators.includes('recent_hiring')) score += 0.6;
    }

    // Leadership team complexity (0-1 points)
    if (prospect.leadershipTeam && prospect.leadershipTeam.length >= 3) score += 1;
    else if (prospect.leadershipTeam && prospect.leadershipTeam.length >= 2) score += 0.5;

    return Math.min(Math.round(score * 10) / 10, 10);
  }

  /**
   * Add prospect to database with qualification scoring
   */
  addProspect(prospectData) {
    const prospect = {
      id: this.prospects.length + 1,
      ...prospectData,
      eosScore: this.scoreProspect(prospectData),
      addedDate: new Date().toISOString(),
      status: 'new'
    };

    this.prospects.push(prospect);
    return prospect;
  }

  /**
   * Get top prospects sorted by EOS score
   */
  getTopProspects(limit = 20) {
    return this.prospects
      .sort((a, b) => b.eosScore - a.eosScore)
      .slice(0, limit);
  }

  /**
   * Generate outreach message for prospect
   */
  generateOutreachMessage(prospect, channel = 'email') {
    const templates = {
      email: {
        subject: `${prospect.company} - Growing Past the Ceiling?`,
        body: `Hi ${prospect.contact.firstName},

I noticed ${prospect.company} has been growing significantly in the ${prospect.industry} space in South Dakota. Congratulations on building what looks like a solid operation with ${prospect.employees}+ team members.

Many successful business leaders I work with around the $${Math.floor(prospect.revenue/1000000)}M revenue mark start hitting what we call "the ceiling" - where the same people and processes that got them here start becoming obstacles to getting to the next level.

I help business owners implement EOS (Entrepreneurial Operating System) - a simple set of tools that creates clarity, accountability, and traction in growing companies. Companies like yours typically see:

• Better leadership team alignment
• Clearer accountability throughout the organization  
• More predictable growth and profitability
• Less owner dependency on day-to-day operations

Would it make sense to have a brief conversation about what growth challenges you're facing at ${prospect.company}? 

I'm in the area next week - would a 15-minute coffee conversation work?

Best regards,
Will`
      },
      
      phone: {
        opener: `Hi ${prospect.contact.firstName}, this is Will calling about ${prospect.company}. I help business owners in the ${prospect.industry} industry break through growth plateaus using a proven system called EOS. Do you have just a minute?`,
        
        qualification: `I work with companies around your size - typically $${Math.floor(prospect.revenue/1000000)}M in revenue with ${prospect.employees}+ employees. Most owners I talk with are dealing with similar challenges: lack of accountability, leadership team not aligned, or feeling like they're hitting a ceiling in their growth. Does any of that resonate?`,
        
        close: `What I'd like to do is spend 90 minutes with you and your leadership team to show you exactly how EOS works and how it could help ${prospect.company}. Would next Tuesday or Wednesday work better for you?`
      },
      
      linkedin: `Hi ${prospect.contact.firstName}, I help business leaders in South Dakota implement EOS (Entrepreneurial Operating System) to break through growth plateaus. I noticed ${prospect.company} has been growing in the ${prospect.industry} space - would love to connect and share some insights that might be valuable for your team.`
    };

    return templates[channel];
  }

  /**
   * Export prospects to CSV
   */
  exportToCSV() {
    const headers = [
      'Company', 'Contact Name', 'Title', 'Email', 'Phone', 'LinkedIn',
      'Industry', 'Revenue', 'Employees', 'EOS Score', 'City', 'Notes'
    ];

    const rows = this.prospects.map(p => [
      p.company,
      `${p.contact.firstName} ${p.contact.lastName}`,
      p.contact.title,
      p.contact.email,
      p.contact.phone,
      p.contact.linkedin,
      p.industry,
      `$${p.revenue.toLocaleString()}`,
      p.employees,
      p.eosScore,
      p.location.city,
      p.notes || ''
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}

module.exports = SDEOSProspectDatabase;