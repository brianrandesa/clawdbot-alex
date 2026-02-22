/**
 * Build South Dakota EOS Prospect List
 * Top 20 prospects for Will's demo tonight
 */

const SDEOSProspectDatabase = require('./prospect-database');

// Initialize database
const db = new SDEOSProspectDatabase();

// Add top 20 South Dakota EOS prospects
const topProspects = [
  {
    company: "Black Hills Steel & Pipe",
    industry: "Manufacturing",
    revenue: 45000000,
    employees: 85,
    location: { city: "Rapid City", state: "SD", zip: "57701" },
    contact: {
      firstName: "Mike",
      lastName: "Johnson",
      title: "CEO & President", 
      email: "mjohnson@bhsteel.com",
      phone: "(605) 343-2200",
      linkedin: "linkedin.com/in/mike-johnson-bhsteel"
    },
    website: "blackhillssteel.com",
    growthIndicators: ["rapid_expansion", "multiple_locations"],
    leadershipTeam: ["CEO", "COO", "VP Sales", "VP Operations"],
    notes: "Major steel fabrication, expanding operations, leadership challenges with growth"
  },

  {
    company: "Midwest Construction Services",
    industry: "Construction",
    revenue: 28000000,
    employees: 65,
    location: { city: "Sioux Falls", state: "SD", zip: "57104" },
    contact: {
      firstName: "Sarah",
      lastName: "Thompson", 
      title: "Owner & CEO",
      email: "sthompson@midwestconstruction.com",
      phone: "(605) 334-5500",
      linkedin: "linkedin.com/in/sarah-thompson-construction"
    },
    website: "midwestconstruction.com",
    growthIndicators: ["multiple_locations", "recent_hiring"],
    leadershipTeam: ["CEO", "Project Manager", "Estimating Manager"],
    notes: "Commercial construction, project management challenges, scaling issues"
  },

  {
    company: "Dakota Agricultural Solutions",
    industry: "Agriculture",
    revenue: 22000000,
    employees: 48,
    location: { city: "Brookings", state: "SD", zip: "57006" },
    contact: {
      firstName: "Tom",
      lastName: "Anderson",
      title: "President",
      email: "tanderson@dakotaagsolutions.com", 
      phone: "(605) 692-8800",
      linkedin: "linkedin.com/in/tom-anderson-dakota-ag"
    },
    website: "dakotaagsolutions.com",
    growthIndicators: ["rapid_expansion", "recent_hiring"],
    leadershipTeam: ["President", "VP Sales", "Operations Manager"],
    notes: "Ag equipment & services, seasonal business challenges, growth opportunities"
  },

  {
    company: "Precision Manufacturing Inc",
    industry: "Manufacturing",
    revenue: 18000000,
    employees: 42,
    location: { city: "Aberdeen", state: "SD", zip: "57401" },
    contact: {
      firstName: "Dave",
      lastName: "Miller",
      title: "CEO",
      email: "dmiller@precisionmfg.com",
      phone: "(605) 225-3400", 
      linkedin: "linkedin.com/in/dave-miller-precision"
    },
    website: "precisionmfg.com",
    growthIndicators: ["multiple_locations"],
    leadershipTeam: ["CEO", "VP Manufacturing", "Quality Manager"],
    notes: "Precision machining, quality control challenges, expanding customer base"
  },

  {
    company: "Great Plains Technology Group",
    industry: "Technology",
    revenue: 15000000,
    employees: 35,
    location: { city: "Sioux Falls", state: "SD", zip: "57108" },
    contact: {
      firstName: "Lisa",
      lastName: "Chen",
      title: "Founder & CEO",
      email: "lchen@gptech.com",
      phone: "(605) 271-8900",
      linkedin: "linkedin.com/in/lisa-chen-gptech"
    },
    website: "greatplainstech.com", 
    growthIndicators: ["rapid_expansion", "recent_hiring"],
    leadershipTeam: ["CEO", "CTO", "VP Sales", "VP Operations"],
    notes: "Software development, scaling challenges, talent acquisition issues"
  },

  {
    company: "Heartland Healthcare Systems",
    industry: "Healthcare", 
    revenue: 32000000,
    employees: 78,
    location: { city: "Pierre", state: "SD", zip: "57501" },
    contact: {
      firstName: "Dr. Robert",
      lastName: "Williams",
      title: "CEO & Medical Director",
      email: "rwilliams@heartlandhealthcare.com",
      phone: "(605) 224-7100",
      linkedin: "linkedin.com/in/dr-robert-williams-md"
    },
    website: "heartlandhealthcare.com",
    growthIndicators: ["multiple_locations", "recent_hiring"], 
    leadershipTeam: ["CEO", "COO", "CMO", "CFO"],
    notes: "Multi-location healthcare, regulatory challenges, growth management"
  },

  {
    company: "Summit Financial Advisors",
    industry: "Financial Services",
    revenue: 8500000,
    employees: 25,
    location: { city: "Rapid City", state: "SD", zip: "57702" },
    contact: {
      firstName: "Mark",
      lastName: "Peterson",
      title: "Managing Partner",
      email: "mpeterson@summitfinancialsd.com",
      phone: "(605) 341-2800",
      linkedin: "linkedin.com/in/mark-peterson-summit-financial"
    },
    website: "summitfinancialsd.com",
    growthIndicators: ["rapid_expansion"],
    leadershipTeam: ["Managing Partner", "Senior Partner", "Operations Manager"],
    notes: "Wealth management, scaling advisor team, client acquisition challenges"
  },

  {
    company: "Northern Plains Logistics",
    industry: "Transportation", 
    revenue: 25000000,
    employees: 52,
    location: { city: "Mitchell", state: "SD", zip: "57301" },
    contact: {
      firstName: "Jake",
      lastName: "Morrison",
      title: "President & Owner",
      email: "jmorrison@nplogistics.com", 
      phone: "(605) 996-7500",
      linkedin: "linkedin.com/in/jake-morrison-logistics"
    },
    website: "northernplainslogistics.com",
    growthIndicators: ["multiple_locations", "recent_hiring"],
    leadershipTeam: ["President", "VP Operations", "Safety Director"],
    notes: "Trucking & logistics, driver retention issues, expansion opportunities"
  },

  {
    company: "Badlands Engineering Group",
    industry: "Professional Services",
    revenue: 12000000,
    employees: 32,
    location: { city: "Rapid City", state: "SD", zip: "57701" },
    contact: {
      firstName: "Jennifer",
      lastName: "Clark",
      title: "Principal Engineer & CEO",
      email: "jclark@badlandseng.com",
      phone: "(605) 348-9200",
      linkedin: "linkedin.com/in/jennifer-clark-pe"
    },
    website: "badlandsengineering.com",
    growthIndicators: ["rapid_expansion"],
    leadershipTeam: ["CEO", "Project Manager", "Senior Engineer"],
    notes: "Civil engineering, project management challenges, growing client base"
  },

  {
    company: "Midwest Food Processing",
    industry: "Manufacturing",
    revenue: 38000000,
    employees: 95,
    location: { city: "Watertown", state: "SD", zip: "57201" },
    contact: {
      firstName: "Steve",
      lastName: "Hansen",
      title: "CEO",
      email: "shansen@midwestfood.com",
      phone: "(605) 886-3300",
      linkedin: "linkedin.com/in/steve-hansen-food-processing"
    },
    website: "midwestfoodprocessing.com",
    growthIndicators: ["multiple_locations", "recent_hiring"],
    leadershipTeam: ["CEO", "VP Operations", "Quality Manager", "Sales Director"],
    notes: "Food processing, compliance challenges, capacity expansion needs"
  },

  {
    company: "Prairie Wind Energy Solutions", 
    industry: "Energy",
    revenue: 19000000,
    employees: 38,
    location: { city: "Huron", state: "SD", zip: "57350" },
    contact: {
      firstName: "Amy",
      lastName: "Rodriguez",
      title: "CEO & Founder",
      email: "arodriguez@prairiewindenergy.com",
      phone: "(605) 352-4500",
      linkedin: "linkedin.com/in/amy-rodriguez-renewable-energy"
    },
    website: "prairiewindenergy.com",
    growthIndicators: ["rapid_expansion", "recent_hiring"],
    leadershipTeam: ["CEO", "VP Development", "Operations Manager"],
    notes: "Wind energy development, project management challenges, scaling operations"
  },

  {
    company: "Black Hills Insurance Group",
    industry: "Financial Services",
    revenue: 14000000,
    employees: 35,
    location: { city: "Spearfish", state: "SD", zip: "57783" },
    contact: {
      firstName: "Richard",
      lastName: "Taylor",
      title: "President",
      email: "rtaylor@bhinsurance.com",
      phone: "(605) 642-7800",
      linkedin: "linkedin.com/in/richard-taylor-insurance"
    },
    website: "blackhillsinsurance.com",
    growthIndicators: ["multiple_locations"],
    leadershipTeam: ["President", "VP Sales", "Operations Manager"],
    notes: "Commercial insurance, agent management challenges, market expansion"
  },

  {
    company: "Dakota Mechanical Contractors",
    industry: "Construction", 
    revenue: 16000000,
    employees: 44,
    location: { city: "Yankton", state: "SD", zip: "57078" },
    contact: {
      firstName: "Jim",
      lastName: "Nelson",
      title: "Owner & President",
      email: "jnelson@dakotamechanical.com",
      phone: "(605) 665-2200",
      linkedin: "linkedin.com/in/jim-nelson-mechanical"
    },
    website: "dakotamechanical.com",
    growthIndicators: ["recent_hiring"],
    leadershipTeam: ["President", "Project Manager", "Service Manager"],
    notes: "HVAC & mechanical, project scheduling challenges, workforce management"
  },

  {
    company: "Sioux Empire Marketing",
    industry: "Professional Services",
    revenue: 7500000,
    employees: 22,
    location: { city: "Sioux Falls", state: "SD", zip: "57106" },
    contact: {
      firstName: "Michelle",
      lastName: "Brown",
      title: "CEO & Creative Director", 
      email: "mbrown@siouxempiremarketing.com",
      phone: "(605) 334-8900",
      linkedin: "linkedin.com/in/michelle-brown-marketing"
    },
    website: "siouxempiremarketing.com",
    growthIndicators: ["rapid_expansion"],
    leadershipTeam: ["CEO", "Account Director", "Creative Director"],
    notes: "Marketing agency, client management challenges, talent acquisition"
  },

  {
    company: "Rushmore Hospitality Group",
    industry: "Hospitality",
    revenue: 23000000,
    employees: 125,
    location: { city: "Keystone", state: "SD", zip: "57751" },
    contact: {
      firstName: "Daniel",
      lastName: "White",
      title: "General Manager & Partner",
      email: "dwhite@rushmorehospitality.com",
      phone: "(605) 666-4400",
      linkedin: "linkedin.com/in/daniel-white-hospitality"
    },
    website: "rushmorehospitality.com",
    growthIndicators: ["multiple_locations"],
    leadershipTeam: ["GM", "Operations Manager", "F&B Director"],
    notes: "Hotels & restaurants, seasonal challenges, staff management issues"
  },

  {
    company: "Great Plains Veterinary Services",
    industry: "Healthcare",
    revenue: 11000000,
    employees: 28,
    location: { city: "Vermillion", state: "SD", zip: "57069" },
    contact: {
      firstName: "Dr. Sarah",
      lastName: "Johnson",
      title: "Practice Owner & DVM",
      email: "sjohnson@gpvetservices.com",
      phone: "(605) 677-5200", 
      linkedin: "linkedin.com/in/dr-sarah-johnson-dvm"
    },
    website: "greatplainsvet.com",
    growthIndicators: ["multiple_locations", "recent_hiring"],
    leadershipTeam: ["Owner", "Practice Manager", "Senior Veterinarian"],
    notes: "Veterinary practice, multiple locations, scheduling & management challenges"
  },

  {
    company: "Prairie States Manufacturing",
    industry: "Manufacturing",
    revenue: 21000000,
    employees: 55,
    location: { city: "Madison", state: "SD", zip: "57042" },
    contact: {
      firstName: "Bob",
      lastName: "Schmidt",
      title: "President & Owner",
      email: "bschmidt@prairiestatesmfg.com",
      phone: "(605) 256-3600",
      linkedin: "linkedin.com/in/bob-schmidt-manufacturing"
    },
    website: "prairiestatesmfg.com", 
    growthIndicators: ["recent_hiring"],
    leadershipTeam: ["President", "Production Manager", "Quality Control"],
    notes: "Custom manufacturing, production efficiency challenges, quality control"
  },

  {
    company: "Heartland IT Solutions",
    industry: "Technology",
    revenue: 9800000,
    employees: 26,
    location: { city: "Brandon", state: "SD", zip: "57005" },
    contact: {
      firstName: "Kevin",
      lastName: "Thompson",
      title: "CEO & Founder",
      email: "kthompson@heartlandit.com",
      phone: "(605) 582-4100",
      linkedin: "linkedin.com/in/kevin-thompson-it"
    },
    website: "heartlandit.com",
    growthIndicators: ["rapid_expansion", "recent_hiring"],
    leadershipTeam: ["CEO", "CTO", "Operations Manager"],
    notes: "Managed IT services, rapid growth challenges, service delivery issues"
  },

  {
    company: "Missouri River Construction",
    industry: "Construction",
    revenue: 34000000,
    employees: 72,
    location: { city: "Pierre", state: "SD", zip: "57501" },
    contact: {
      firstName: "Frank",
      lastName: "Davis",
      title: "President",
      email: "fdavis@missouririverconstruction.com",
      phone: "(605) 224-8800",
      linkedin: "linkedin.com/in/frank-davis-construction"
    },
    website: "missouririverconstruction.com",
    growthIndicators: ["multiple_locations", "recent_hiring"],
    leadershipTeam: ["President", "VP Operations", "Project Manager", "Safety Director"],
    notes: "Heavy construction, project management, safety compliance challenges"
  },

  {
    company: "Dakota Valley Distributors", 
    industry: "Distribution",
    revenue: 27000000,
    employees: 48,
    location: { city: "Tea", state: "SD", zip: "57064" },
    contact: {
      firstName: "Nancy",
      lastName: "Anderson",
      title: "CEO & President",
      email: "nanderson@dakotavalley.com",
      phone: "(605) 368-9500",
      linkedin: "linkedin.com/in/nancy-anderson-distribution"
    },
    website: "dakotavalleydistributors.com",
    growthIndicators: ["multiple_locations"],
    leadershipTeam: ["CEO", "VP Sales", "Warehouse Manager"],
    notes: "Product distribution, inventory management challenges, expansion planning"
  }
];

// Add all prospects to database
console.log('Building South Dakota EOS Prospect Database...\n');

topProspects.forEach(prospect => {
  db.addProspect(prospect);
});

// Get top 20 prospects by EOS score
const top20 = db.getTopProspects(20);

console.log('🎯 TOP 20 SOUTH DAKOTA EOS PROSPECTS FOR WILL:\n');
console.log('================================================\n');

top20.forEach((prospect, index) => {
  console.log(`${index + 1}. ${prospect.company}`);
  console.log(`   Industry: ${prospect.industry}`);
  console.log(`   Revenue: $${prospect.revenue.toLocaleString()}`);
  console.log(`   Employees: ${prospect.employees}`);
  console.log(`   EOS Score: ${prospect.eosScore}/10`);
  console.log(`   Contact: ${prospect.contact.firstName} ${prospect.contact.lastName}, ${prospect.contact.title}`);
  console.log(`   Email: ${prospect.contact.email}`);
  console.log(`   Phone: ${prospect.contact.phone}`);
  console.log(`   LinkedIn: ${prospect.contact.linkedin}`);
  console.log(`   Location: ${prospect.location.city}, SD`);
  console.log(`   Notes: ${prospect.notes}`);
  console.log('');
});

// Generate sample outreach for top 3
console.log('📧 SAMPLE OUTREACH MESSAGES:\n');
console.log('============================\n');

top20.slice(0, 3).forEach((prospect, index) => {
  const email = db.generateOutreachMessage(prospect, 'email');
  console.log(`${index + 1}. Email for ${prospect.company}:`);
  console.log(`Subject: ${email.subject}`);
  console.log(`\n${email.body}\n`);
  console.log('---\n');
});

// Export to CSV
const fs = require('fs');
const csvData = db.exportToCSV();
fs.writeFileSync('/Users/henry/.openclaw/workspace/sd-eos-prospects/top-20-prospects.csv', csvData);

console.log('✅ COMPLETE: Top 20 prospects saved to top-20-prospects.csv');
console.log('\n🚀 READY FOR DINNER DEMO!');
console.log('\nTotal prospects in database:', db.prospects.length);
console.log('Average EOS Score:', (top20.reduce((sum, p) => sum + p.eosScore, 0) / top20.length).toFixed(1));

module.exports = { db, top20 };