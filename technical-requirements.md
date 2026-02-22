# ESA Funnel 2.0 - Technical Requirements Document
## For Claude Code Development Team

---

## PROJECT OVERVIEW

**Objective:** Rebuild event-sales-funnel.vercel.app with advanced qualification system and 10x conversion optimization
**Target:** Reduce unqualified calls from 45% to under 10%, increase overall conversion rates 10x
**Timeline:** 2-3 weeks for complete rebuild
**Platform:** Current Vercel deployment, maintain existing hosting

---

## TECHNICAL ARCHITECTURE REQUIREMENTS

### Core Tech Stack (Keep Existing)
- **Frontend:** HTML5, CSS3, JavaScript (vanilla)
- **Hosting:** Vercel with existing domain
- **Analytics:** Facebook Pixel (update ID), Google Analytics 4
- **Forms:** Native HTML forms with JavaScript validation

### New Integrations Required
- **CRM Integration:** HubSpot or Pipedrive API for lead scoring
- **Calendar System:** Calendly or similar for booking flows  
- **Email Automation:** Mailgun/SendGrid for nurture sequences
- **SMS Integration:** Twilio for qualification notifications

---

## ADVANCED QUALIFICATION SYSTEM

### Scoring Algorithm Implementation

```javascript
// qualification-scoring.js
class QualificationScorer {
  constructor() {
    this.questions = {
      // Layer 1: Basic Qualifying (20 points max)
      eventType: {
        'business-conference': 5,
        'coaching-event': 4,
        'mastermind': 5,
        'trade-show': 3,
        'webinar': 2,
        'networking': 1,
        'wedding-social': 0,
        'other': 0
      },
      timeline: {
        '0-3-months': 5,
        '3-6-months': 3,
        '6-12-months': 1,
        'no-date': 0
      },
      budget: {
        '25k-plus': 5,
        '15k-25k': 3,
        '10k-15k': 1,
        'under-10k': 0
      },
      backend: {
        'yes-25k-plus': 5,
        'yes-10k-25k': 3,
        'yes-5k-10k': 1,
        'no-backend': 0
      },
      
      // Layer 2: Advanced Scorecard (40 points max)
      previousEvents: {
        '10-plus': 5,
        '5-9': 4,
        '2-4': 2,
        '0-1': 0
      },
      targetAttendance: {
        '500-plus': 5,
        '200-499': 4,
        '50-199': 2,
        'under-50': 0
      },
      ticketPricing: {
        '500-plus': 5,
        '200-499': 4,
        '99-199': 2,
        'under-99': 0
      },
      emailList: {
        '10k-plus': 5,
        '5k-9999': 4,
        '1k-4999': 2,
        'under-1k': 0
      },
      socialFollowing: {
        '10k-plus': 5,
        '5k-9999': 4,
        '1k-4999': 2,
        'under-1k': 0
      },
      decisionMaker: {
        'yes': 5,
        'no': 0
      },
      currentMarketing: {
        'agency': 5,
        'in-house': 3,
        'freelancer': 1,
        'myself': 0
      },
      biggestChallenge: {
        'qualified-buyers': 5,
        'scaling-marketing': 4,
        'ad-profitability': 2,
        'logistics': 1
      }
    };
    
    this.thresholds = {
      premium: 45,      // Direct booking
      standard: 35,     // Pre-qualification call
      nurture: 25,      // Educational sequence
      disqualified: 0   // Respectful redirect
    };
  }
  
  calculateScore(answers) {
    let totalScore = 0;
    
    // Layer 1 scoring (required questions)
    const layer1Score = this.calculateLayer1(answers);
    if (layer1Score < 8) {
      return { score: layer1Score, tier: 'disqualified', layer: 1 };
    }
    
    // Layer 2 scoring (advanced questions)  
    const layer2Score = this.calculateLayer2(answers);
    totalScore = layer1Score + layer2Score;
    
    const tier = this.determineTier(totalScore);
    
    return {
      score: totalScore,
      tier: tier,
      layer: 2,
      breakdown: this.getScoreBreakdown(answers)
    };
  }
  
  calculateLayer1(answers) {
    const questions = ['eventType', 'timeline', 'budget', 'backend'];
    return questions.reduce((score, question) => {
      return score + (this.questions[question][answers[question]] || 0);
    }, 0);
  }
  
  calculateLayer2(answers) {
    const questions = ['previousEvents', 'targetAttendance', 'ticketPricing', 
                      'emailList', 'socialFollowing', 'decisionMaker', 
                      'currentMarketing', 'biggestChallenge'];
    return questions.reduce((score, question) => {
      return score + (this.questions[question][answers[question]] || 0);
    }, 0);
  }
  
  determineTier(score) {
    if (score >= this.thresholds.premium) return 'premium';
    if (score >= this.thresholds.standard) return 'standard';
    if (score >= this.thresholds.nurture) return 'nurture';
    return 'disqualified';
  }
}
```

### Progressive Quiz Implementation

```javascript
// quiz-flow.js
class QuizFlow {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 12; // 4 Layer 1 + 8 Layer 2
    this.answers = {};
    this.scorer = new QualificationScorer();
    this.layer1Complete = false;
  }
  
  handleStepComplete(stepData) {
    this.answers[stepData.question] = stepData.answer;
    
    // Check for Layer 1 completion (after question 4)
    if (this.currentStep === 4 && !this.layer1Complete) {
      const layer1Result = this.scorer.calculateScore(this.answers);
      
      if (layer1Result.tier === 'disqualified') {
        this.redirectToDisqualified(layer1Result.score);
        return;
      }
      
      this.layer1Complete = true;
      this.showLayer2Intro();
    }
    
    // Progress to next step
    this.currentStep++;
    this.updateProgressBar();
    
    // Complete quiz after all questions
    if (this.currentStep > this.totalSteps) {
      this.completeQuiz();
    }
  }
  
  completeQuiz() {
    const finalResult = this.scorer.calculateScore(this.answers);
    
    // Send to analytics
    this.trackQuizCompletion(finalResult);
    
    // Route based on qualification
    this.routeBasedOnQualification(finalResult);
  }
  
  routeBasedOnQualification(result) {
    const routes = {
      premium: '/booking-premium.html',
      standard: '/booking-standard.html', 
      nurture: '/email-capture.html',
      disqualified: '/not-qualified.html'
    };
    
    // Store result for next page
    sessionStorage.setItem('qualificationResult', JSON.stringify(result));
    
    // Redirect to appropriate page
    window.location.href = routes[result.tier];
  }
}
```

### Dynamic Content Loading

```javascript
// dynamic-content.js
class DynamicContent {
  constructor() {
    this.qualificationResult = JSON.parse(
      sessionStorage.getItem('qualificationResult') || '{}'
    );
  }
  
  personalizePage() {
    const tier = this.qualificationResult.tier;
    
    switch(tier) {
      case 'premium':
        this.loadPremiumContent();
        break;
      case 'standard':
        this.loadStandardContent();
        break;
      case 'nurture':
        this.loadNurtureContent();
        break;
      case 'disqualified':
        this.loadDisqualifiedContent();
        break;
    }
  }
  
  loadPremiumContent() {
    // Show premium booking page with direct calendar
    document.querySelector('.booking-type').textContent = 'PREMIUM QUALIFIED';
    document.querySelector('.session-length').textContent = '45 minutes';
    document.querySelector('.session-type').textContent = 'Strategy Session';
    
    // Load Calendly widget for strategy sessions
    this.loadCalendlyWidget('premium-sessions');
  }
  
  loadStandardContent() {
    // Show standard booking page with pre-qualification  
    document.querySelector('.booking-type').textContent = 'QUALIFIED';
    document.querySelector('.session-length').textContent = '15 minutes';
    document.querySelector('.session-type').textContent = 'Qualification Call';
    
    // Load Calendly widget for qualification calls
    this.loadCalendlyWidget('qualification-calls');
  }
}
```

---

## CRM INTEGRATION REQUIREMENTS

### HubSpot Integration (Preferred)

```javascript
// hubspot-integration.js
class HubSpotIntegration {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.hubapi.com/crm/v3/objects/contacts';
  }
  
  async createContact(contactData, qualificationResult) {
    const contact = {
      properties: {
        email: contactData.email,
        firstname: contactData.firstName,
        lastname: contactData.lastName,
        phone: contactData.phone,
        company: contactData.company,
        
        // Custom qualification properties
        qualification_score: qualificationResult.score,
        qualification_tier: qualificationResult.tier,
        event_type: contactData.eventType,
        event_timeline: contactData.timeline,
        marketing_budget: contactData.budget,
        backend_offer: contactData.backend,
        
        // Lifecycle stage based on qualification
        lifecyclestage: this.getLifecycleStage(qualificationResult.tier),
        
        // Lead source
        lead_source: 'Event Sales Funnel 2.0',
        lead_source_detail: window.location.href
      }
    };
    
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(contact)
    });
    
    if (response.ok) {
      const contactRecord = await response.json();
      
      // Trigger appropriate workflows
      this.triggerWorkflow(qualificationResult.tier, contactRecord.id);
      
      return contactRecord;
    } else {
      throw new Error('Failed to create HubSpot contact');
    }
  }
  
  getLifecycleStage(tier) {
    const stages = {
      premium: 'marketingqualifiedlead',
      standard: 'lead',
      nurture: 'subscriber',
      disqualified: 'other'
    };
    return stages[tier] || 'lead';
  }
  
  async triggerWorkflow(tier, contactId) {
    const workflows = {
      premium: 'premium-qualification-workflow',
      standard: 'standard-qualification-workflow',
      nurture: 'nurture-sequence-workflow',
      disqualified: 'disqualified-follow-up-workflow'
    };
    
    const workflowId = workflows[tier];
    if (!workflowId) return;
    
    // Trigger HubSpot workflow
    await fetch(`https://api.hubapi.com/automation/v2/workflows/${workflowId}/enrollments/contacts/${contactId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }
}
```

### Sales Team Notification System

```javascript
// notifications.js
class NotificationSystem {
  constructor() {
    this.webhookUrl = process.env.SLACK_WEBHOOK_URL;
    this.smsService = new TwilioService();
  }
  
  async notifyNewQualifiedLead(contactData, qualificationResult) {
    const tier = qualificationResult.tier;
    
    if (tier === 'premium' || tier === 'standard') {
      // Immediate notification for qualified leads
      await this.sendSlackNotification(contactData, qualificationResult);
      
      if (tier === 'premium') {
        // SMS alert for premium leads
        await this.sendSMSAlert(contactData, qualificationResult);
      }
    }
  }
  
  async sendSlackNotification(contactData, qualificationResult) {
    const message = {
      text: `🎯 New ${qualificationResult.tier.toUpperCase()} Qualified Lead!`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `${qualificationResult.tier.toUpperCase()} Qualified Lead - Score: ${qualificationResult.score}`
          }
        },
        {
          type: 'section',
          fields: [
            { type: 'mrkdwn', text: `*Name:* ${contactData.firstName} ${contactData.lastName}` },
            { type: 'mrkdwn', text: `*Email:* ${contactData.email}` },
            { type: 'mrkdwn', text: `*Phone:* ${contactData.phone}` },
            { type: 'mrkdwn', text: `*Company:* ${contactData.company}` },
            { type: 'mrkdwn', text: `*Event Type:* ${contactData.eventType}` },
            { type: 'mrkdwn', text: `*Budget:* ${contactData.budget}` },
            { type: 'mrkdwn', text: `*Timeline:* ${contactData.timeline}` },
            { type: 'mrkdwn', text: `*Backend Offer:* ${contactData.backend}` }
          ]
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: { type: 'plain_text', text: 'View in HubSpot' },
              url: `https://app.hubspot.com/contacts/YOUR_PORTAL_ID/contact/${contactData.hubspotId}`
            }
          ]
        }
      ]
    };
    
    await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message)
    });
  }
}
```

---

## FRONTEND REQUIREMENTS

### Mobile-First Responsive Design

```css
/* styles.css - Mobile-First Approach */

/* Base styles (mobile) */
.quiz-container {
  width: 100%;
  max-width: 100vw;
  padding: 1rem;
  box-sizing: border-box;
}

.quiz-question {
  font-size: 1.5rem;
  line-height: 1.4;
  margin-bottom: 1.5rem;
  text-align: center;
}

.quiz-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.quiz-option {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 60px; /* Thumb-friendly */
  font-size: 1rem;
}

.quiz-option:hover,
.quiz-option:focus {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.quiz-option.selected {
  border-color: #1d4ed8;
  background-color: #dbeafe;
}

.cta-button {
  width: 100%;
  min-height: 48px; /* Mobile accessibility standard */
  font-size: 1.1rem;
  font-weight: 600;
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #1d4ed8, #2563eb);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(29, 78, 216, 0.3);
}

/* Tablet styles */
@media (min-width: 768px) {
  .quiz-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  .quiz-question {
    font-size: 2rem;
  }
  
  .quiz-options {
    gap: 1.5rem;
  }
  
  .quiz-option {
    padding: 1.5rem;
    font-size: 1.1rem;
  }
}

/* Desktop styles */
@media (min-width: 1024px) {
  .quiz-container {
    max-width: 800px;
    padding: 3rem;
  }
  
  .hero-content {
    text-align: center;
    max-width: 900px;
    margin: 0 auto;
  }
  
  .testimonials {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 2rem;
  }
}
```

### Interactive Elements

```javascript
// interactive.js
class InteractiveElements {
  constructor() {
    this.initProgressBar();
    this.initAnimations();
    this.initMobileOptimizations();
  }
  
  initProgressBar() {
    const progressBar = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    this.updateProgress = (current, total) => {
      const percentage = (current / total) * 100;
      progressBar.style.width = `${percentage}%`;
      progressText.textContent = `Question ${current} of ${total}`;
      
      // Animate the progress
      progressBar.style.transition = 'width 0.3s ease';
    };
  }
  
  initAnimations() {
    // Fade in animations for quiz steps
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, observerOptions);
    
    document.querySelectorAll('.quiz-step').forEach(step => {
      step.style.opacity = '0';
      step.style.transform = 'translateY(20px)';
      step.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      observer.observe(step);
    });
  }
  
  initMobileOptimizations() {
    // Prevent zoom on input focus (iOS)
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        const viewport = document.querySelector('meta[name="viewport"]');
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      });
      
      input.addEventListener('blur', () => {
        const viewport = document.querySelector('meta[name="viewport"]');
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
      });
    });
    
    // Smooth scrolling for mobile
    this.initSmoothScrolling();
  }
  
  initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }
}
```

---

## ANALYTICS & TRACKING REQUIREMENTS

### Enhanced Facebook Pixel Tracking

```javascript
// tracking.js
class FunnelTracking {
  constructor() {
    this.fbq = window.fbq || function() {};
    this.gtag = window.gtag || function() {};
  }
  
  // Page view tracking
  trackPageView(page) {
    this.fbq('track', 'PageView');
    this.gtag('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.href
    });
  }
  
  // Quiz interaction tracking
  trackQuizStart() {
    this.fbq('track', 'InitiateCheckout');
    this.gtag('event', 'begin_checkout');
  }
  
  trackQuizProgress(step, totalSteps) {
    const progress = (step / totalSteps) * 100;
    
    this.fbq('trackCustom', 'QuizProgress', {
      step: step,
      total_steps: totalSteps,
      progress_percentage: progress
    });
    
    this.gtag('event', 'quiz_progress', {
      step: step,
      progress: progress
    });
  }
  
  trackQualificationResult(result) {
    this.fbq('track', 'Lead', {
      qualification_tier: result.tier,
      qualification_score: result.score
    });
    
    this.gtag('event', 'generate_lead', {
      qualification_tier: result.tier,
      qualification_score: result.score
    });
    
    // Custom events by tier
    if (result.tier === 'premium') {
      this.fbq('trackCustom', 'PremiumQualified', {
        score: result.score
      });
    }
  }
  
  trackBookingAttempt(tier) {
    this.fbq('track', 'Schedule', {
      qualification_tier: tier
    });
    
    this.gtag('event', 'book_appointment', {
      tier: tier
    });
  }
  
  trackFormSubmission(formType, data) {
    this.fbq('track', 'CompleteRegistration', {
      form_type: formType
    });
    
    this.gtag('event', 'sign_up', {
      method: formType
    });
  }
}
```

### A/B Testing Framework

```javascript
// ab-testing.js
class ABTesting {
  constructor() {
    this.experiments = {
      headline: {
        variants: [
          'The $15K Event Sales System That Consistently Fills Events',
          'How To Fill Your Next Event & Generate 6-Figure Backend Sales',
          'The Proven System Behind $65M In Event Revenue'
        ],
        active: true
      },
      cta: {
        variants: [
          'See If You Qualify For The System →',
          'Apply For The Event Sales System →',
          'Book Your Event Strategy Call →'
        ],
        active: true
      },
      socialProof: {
        variants: [
          'client-logos',
          'video-testimonials', 
          'case-studies'
        ],
        active: true
      }
    };
  }
  
  assignVariant(experimentName) {
    const experiment = this.experiments[experimentName];
    if (!experiment || !experiment.active) return null;
    
    let variantIndex = localStorage.getItem(`variant_${experimentName}`);
    
    if (!variantIndex) {
      variantIndex = Math.floor(Math.random() * experiment.variants.length);
      localStorage.setItem(`variant_${experimentName}`, variantIndex);
    }
    
    return {
      experiment: experimentName,
      variant: experiment.variants[variantIndex],
      variantIndex: parseInt(variantIndex)
    };
  }
  
  trackVariantView(experimentName, variant) {
    // Track which variant was shown
    this.gtag('event', 'ab_test_view', {
      experiment: experimentName,
      variant: variant
    });
  }
  
  trackVariantConversion(experimentName, variant) {
    // Track conversions by variant
    this.gtag('event', 'ab_test_conversion', {
      experiment: experimentName,
      variant: variant
    });
  }
}
```

---

## PERFORMANCE REQUIREMENTS

### Page Speed Optimization

```javascript
// performance.js
class PerformanceOptimizer {
  constructor() {
    this.initLazyLoading();
    this.preloadCriticalResources();
    this.optimizeImages();
  }
  
  initLazyLoading() {
    // Lazy load images below the fold
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
  }
  
  preloadCriticalResources() {
    // Preload critical CSS and fonts
    const critical = [
      { href: '/css/critical.css', as: 'style' },
      { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap', as: 'style' }
    ];
    
    critical.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      document.head.appendChild(link);
    });
  }
  
  optimizeImages() {
    // Use WebP with fallback
    const supportsWebp = this.checkWebpSupport();
    
    if (supportsWebp) {
      document.querySelectorAll('img[data-webp]').forEach(img => {
        img.src = img.dataset.webp;
      });
    }
  }
  
  checkWebpSupport() {
    return new Promise((resolve) => {
      const webp = new Image();
      webp.onload = webp.onerror = () => resolve(webp.height === 2);
      webp.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }
}
```

### Security Requirements

```javascript
// security.js
class SecurityMeasures {
  constructor() {
    this.initCSRFProtection();
    this.sanitizeInputs();
    this.rateLimitSubmissions();
  }
  
  initCSRFProtection() {
    // Generate CSRF token for form submissions
    const token = this.generateCSRFToken();
    document.querySelectorAll('form').forEach(form => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = 'csrf_token';
      input.value = token;
      form.appendChild(input);
    });
  }
  
  generateCSRFToken() {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  
  sanitizeInputs() {
    // Sanitize all form inputs
    document.querySelectorAll('input, textarea').forEach(input => {
      input.addEventListener('input', (e) => {
        e.target.value = this.sanitizeString(e.target.value);
      });
    });
  }
  
  sanitizeString(str) {
    return str
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '');
  }
  
  rateLimitSubmissions() {
    const submissions = new Map();
    
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', (e) => {
        const ip = this.getClientIP();
        const now = Date.now();
        const lastSubmission = submissions.get(ip) || 0;
        
        if (now - lastSubmission < 60000) { // 1 minute rate limit
          e.preventDefault();
          alert('Please wait before submitting again.');
          return;
        }
        
        submissions.set(ip, now);
      });
    });
  }
}
```

---

## DEPLOYMENT REQUIREMENTS

### Environment Configuration

```javascript
// config.js
const config = {
  development: {
    api: {
      hubspot: process.env.DEV_HUBSPOT_API_KEY,
      twilio: process.env.DEV_TWILIO_API_KEY,
      calendly: process.env.DEV_CALENDLY_API_KEY
    },
    analytics: {
      facebook_pixel: 'DEV_PIXEL_ID',
      google_analytics: 'DEV_GA_ID'
    },
    webhooks: {
      slack: process.env.DEV_SLACK_WEBHOOK
    }
  },
  production: {
    api: {
      hubspot: process.env.PROD_HUBSPOT_API_KEY,
      twilio: process.env.PROD_TWILIO_API_KEY,
      calendly: process.env.PROD_CALENDLY_API_KEY
    },
    analytics: {
      facebook_pixel: 'PROD_PIXEL_ID',
      google_analytics: 'PROD_GA_ID'
    },
    webhooks: {
      slack: process.env.PROD_SLACK_WEBHOOK
    }
  }
};

export default config[process.env.NODE_ENV || 'development'];
```

### Vercel Configuration

```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    },
    {
      "src": "*.html",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production",
    "HUBSPOT_API_KEY": "@hubspot-api-key",
    "TWILIO_API_KEY": "@twilio-api-key",
    "SLACK_WEBHOOK": "@slack-webhook-url"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options", 
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

---

## TESTING REQUIREMENTS

### Automated Testing Suite

```javascript
// tests/qualification-scoring.test.js
import { QualificationScorer } from '../js/qualification-scoring.js';

describe('Qualification Scoring System', () => {
  let scorer;
  
  beforeEach(() => {
    scorer = new QualificationScorer();
  });
  
  test('should disqualify prospects with no backend offer', () => {
    const answers = {
      eventType: 'business-conference',
      timeline: '0-3-months',
      budget: '25k-plus',
      backend: 'no-backend'
    };
    
    const result = scorer.calculateScore(answers);
    expect(result.tier).toBe('disqualified');
  });
  
  test('should qualify premium prospects correctly', () => {
    const answers = {
      eventType: 'business-conference',
      timeline: '0-3-months', 
      budget: '25k-plus',
      backend: 'yes-25k-plus',
      previousEvents: '10-plus',
      targetAttendance: '500-plus',
      ticketPricing: '500-plus',
      emailList: '10k-plus',
      socialFollowing: '10k-plus',
      decisionMaker: 'yes',
      currentMarketing: 'agency',
      biggestChallenge: 'qualified-buyers'
    };
    
    const result = scorer.calculateScore(answers);
    expect(result.tier).toBe('premium');
    expect(result.score).toBeGreaterThanOrEqual(45);
  });
  
  test('should handle edge cases gracefully', () => {
    const emptyAnswers = {};
    const result = scorer.calculateScore(emptyAnswers);
    expect(result.score).toBe(0);
    expect(result.tier).toBe('disqualified');
  });
});
```

### Performance Testing

```javascript
// tests/performance.test.js
describe('Performance Requirements', () => {
  test('page should load within 3 seconds', async () => {
    const startTime = Date.now();
    
    // Simulate page load
    await new Promise(resolve => {
      window.addEventListener('load', resolve);
    });
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000);
  });
  
  test('quiz should be responsive on mobile', async () => {
    // Test mobile viewport
    window.innerWidth = 375;
    window.innerHeight = 667;
    
    const quizOptions = document.querySelectorAll('.quiz-option');
    quizOptions.forEach(option => {
      const height = option.offsetHeight;
      expect(height).toBeGreaterThanOrEqual(44); // Minimum touch target
    });
  });
});
```

---

## SUCCESS METRICS & MONITORING

### Key Performance Indicators

```javascript
// monitoring.js
class FunnelMonitoring {
  constructor() {
    this.metrics = {
      // Conversion funnel
      pageViews: 0,
      quizStarts: 0,
      quizCompletions: 0,
      qualifiedLeads: 0,
      bookingAttempts: 0,
      bookingCompletions: 0,
      
      // Qualification breakdown
      premiumQualified: 0,
      standardQualified: 0,
      nurtureQualified: 0,
      disqualified: 0,
      
      // Performance metrics
      avgQuizCompletionTime: 0,
      avgPageLoadTime: 0,
      mobileConversionRate: 0,
      desktopConversionRate: 0
    };
  }
  
  trackMetric(metricName, value = 1) {
    this.metrics[metricName] += value;
    this.sendToAnalytics(metricName, value);
  }
  
  calculateConversionRates() {
    return {
      quizStartRate: (this.metrics.quizStarts / this.metrics.pageViews) * 100,
      quizCompletionRate: (this.metrics.quizCompletions / this.metrics.quizStarts) * 100,
      qualificationRate: (this.metrics.qualifiedLeads / this.metrics.quizCompletions) * 100,
      bookingRate: (this.metrics.bookingCompletions / this.metrics.qualifiedLeads) * 100,
      overallConversionRate: (this.metrics.bookingCompletions / this.metrics.pageViews) * 100
    };
  }
  
  generateReport() {
    const rates = this.calculateConversionRates();
    
    return {
      summary: {
        totalVisitors: this.metrics.pageViews,
        totalBookings: this.metrics.bookingCompletions,
        overallConversion: rates.overallConversionRate.toFixed(2) + '%'
      },
      funnel: {
        'Page Views': this.metrics.pageViews,
        'Quiz Starts': `${this.metrics.quizStarts} (${rates.quizStartRate.toFixed(1)}%)`,
        'Quiz Completions': `${this.metrics.quizCompletions} (${rates.quizCompletionRate.toFixed(1)}%)`,
        'Qualified Leads': `${this.metrics.qualifiedLeads} (${rates.qualificationRate.toFixed(1)}%)`,
        'Bookings': `${this.metrics.bookingCompletions} (${rates.bookingRate.toFixed(1)}%)`
      },
      qualification: {
        'Premium': this.metrics.premiumQualified,
        'Standard': this.metrics.standardQualified,  
        'Nurture': this.metrics.nurtureQualified,
        'Disqualified': this.metrics.disqualified
      }
    };
  }
}
```

---

## LAUNCH CHECKLIST

### Pre-Launch Requirements

- [ ] All qualification logic tested and validated
- [ ] Mobile responsiveness confirmed on iOS/Android  
- [ ] Page speed under 3 seconds on 3G connection
- [ ] All integrations tested (HubSpot, Calendly, Twilio)
- [ ] Analytics tracking verified
- [ ] A/B testing framework implemented  
- [ ] Security measures in place
- [ ] Error handling and fallbacks tested
- [ ] Cross-browser compatibility confirmed
- [ ] Accessibility standards met (WCAG 2.1 AA)

### Go-Live Sequence

1. **Soft Launch:** Deploy to staging environment for final testing
2. **Team Training:** Sales team briefed on new qualification tiers
3. **Monitoring Setup:** All tracking and alerts configured
4. **Gradual Rollout:** Start with 10% traffic, increase based on performance
5. **Full Launch:** Complete traffic migration after performance validation

---

**ESTIMATED TIMELINE: 2-3 weeks for complete implementation**
**PRIORITY: High - Target 10x conversion improvement**

*Ready for technical implementation by Claude Code team.*