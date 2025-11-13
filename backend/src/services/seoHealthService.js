const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Run comprehensive SEO health check on a website
 */
async function runSEOHealthCheck(websiteUrl) {
  try {
    // Normalize URL
    const normalizedUrl = websiteUrl.startsWith('http') 
      ? websiteUrl 
      : `https://${websiteUrl}`;

    // Run all checks in parallel
    const [
      pageData,
      performanceData,
      technicalData,
      contentData,
      securityData
    ] = await Promise.all([
      fetchPageData(normalizedUrl),
      checkPerformance(normalizedUrl),
      checkTechnicalSEO(normalizedUrl),
      checkContentQuality(normalizedUrl),
      checkSecurity(normalizedUrl)
    ]);

    // Calculate overall score
    const scores = {
      technical: technicalData.score,
      onPage: pageData.score,
      content: contentData.score,
      performance: performanceData.score,
      security: securityData.score
    };

    const overallScore = Math.round(
      (scores.technical + scores.onPage + scores.content + scores.performance + scores.security) / 5
    );

    // Compile all issues
    const allIssues = [
      ...technicalData.issues,
      ...pageData.issues,
      ...contentData.issues,
      ...performanceData.issues,
      ...securityData.issues
    ];

    // Generate action items
    const actionItems = generateActionItems(allIssues, scores);

    return {
      overallScore,
      categories: {
        technicalSeo: {
          score: scores.technical,
          status: getStatus(scores.technical),
          issues: technicalData.issues,
          details: technicalData.details
        },
        onPageSeo: {
          score: scores.onPage,
          status: getStatus(scores.onPage),
          issues: pageData.issues,
          details: pageData.details
        },
        contentQuality: {
          score: scores.content,
          status: getStatus(scores.content),
          issues: contentData.issues,
          details: contentData.details
        },
        performance: {
          score: scores.performance,
          status: getStatus(scores.performance),
          issues: performanceData.issues,
          details: performanceData.details
        },
        security: {
          score: scores.security,
          status: getStatus(scores.security),
          issues: securityData.issues,
          details: securityData.details
        }
      },
      actionItems,
      checkedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error running SEO health check:', error);
    throw new Error(`Failed to run SEO check: ${error.message}`);
  }
}

/**
 * Fetch and analyze page data
 */
async function fetchPageData(url) {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; StackIQ-SEO-Bot/1.0)'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);
    
    const issues = [];
    const details = {};
    let score = 100;

    // Check title tag
    const title = $('title').text();
    details.title = title;
    if (!title) {
      issues.push('Missing page title');
      score -= 15;
    } else if (title.length < 30) {
      issues.push('Title tag is too short (< 30 characters)');
      score -= 5;
    } else if (title.length > 60) {
      issues.push('Title tag is too long (> 60 characters)');
      score -= 5;
    }

    // Check meta description
    const metaDescription = $('meta[name="description"]').attr('content');
    details.metaDescription = metaDescription;
    if (!metaDescription) {
      issues.push('Missing meta description');
      score -= 15;
    } else if (metaDescription.length < 120) {
      issues.push('Meta description is too short (< 120 characters)');
      score -= 5;
    } else if (metaDescription.length > 160) {
      issues.push('Meta description is too long (> 160 characters)');
      score -= 5;
    }

    // Check headings
    const h1Count = $('h1').length;
    details.h1Count = h1Count;
    if (h1Count === 0) {
      issues.push('No H1 heading found');
      score -= 10;
    } else if (h1Count > 1) {
      issues.push(`Multiple H1 headings found (${h1Count})`);
      score -= 5;
    }

    // Check images
    const images = $('img');
    let imagesWithoutAlt = 0;
    images.each((i, img) => {
      if (!$(img).attr('alt')) {
        imagesWithoutAlt++;
      }
    });
    details.totalImages = images.length;
    details.imagesWithoutAlt = imagesWithoutAlt;
    if (imagesWithoutAlt > 0) {
      issues.push(`${imagesWithoutAlt} images missing alt text`);
      score -= Math.min(10, imagesWithoutAlt * 2);
    }

    // Check canonical tag
    const canonical = $('link[rel="canonical"]').attr('href');
    details.canonical = canonical;
    if (!canonical) {
      issues.push('Missing canonical tag');
      score -= 5;
    }

    // Check Open Graph tags
    const ogTitle = $('meta[property="og:title"]').attr('content');
    const ogDescription = $('meta[property="og:description"]').attr('content');
    const ogImage = $('meta[property="og:image"]').attr('content');
    details.openGraph = { title: ogTitle, description: ogDescription, image: ogImage };
    if (!ogTitle || !ogDescription) {
      issues.push('Incomplete Open Graph tags');
      score -= 5;
    }

    return {
      score: Math.max(0, score),
      issues,
      details
    };
  } catch (error) {
    console.error('Error fetching page data:', error.message);
    return {
      score: 50,
      issues: [`Unable to fetch page: ${error.message}`],
      details: {}
    };
  }
}

/**
 * Check technical SEO
 */
async function checkTechnicalSEO(url) {
  try {
    const issues = [];
    const details = {};
    let score = 100;

    // Check robots.txt
    try {
      const robotsUrl = new URL('/robots.txt', url).href;
      const robotsResponse = await axios.get(robotsUrl, { timeout: 5000 });
      details.robotsTxt = 'Found';
      details.robotsContent = robotsResponse.data.substring(0, 200);
    } catch (error) {
      issues.push('robots.txt not found');
      details.robotsTxt = 'Not found';
      score -= 10;
    }

    // Check sitemap
    try {
      const sitemapUrl = new URL('/sitemap.xml', url).href;
      const sitemapResponse = await axios.get(sitemapUrl, { timeout: 5000 });
      details.sitemap = 'Found';
    } catch (error) {
      issues.push('sitemap.xml not found');
      details.sitemap = 'Not found';
      score -= 10;
    }

    // Check HTTPS
    if (!url.startsWith('https://')) {
      issues.push('Website not using HTTPS');
      score -= 20;
      details.https = false;
    } else {
      details.https = true;
    }

    // Check response time
    const startTime = Date.now();
    await axios.get(url, { timeout: 10000 });
    const responseTime = Date.now() - startTime;
    details.responseTime = `${responseTime}ms`;
    
    if (responseTime > 3000) {
      issues.push(`Slow response time (${responseTime}ms)`);
      score -= 15;
    } else if (responseTime > 1500) {
      issues.push(`Moderate response time (${responseTime}ms)`);
      score -= 5;
    }

    // Check mobile-friendly meta tag
    const response = await axios.get(url, { timeout: 10000 });
    const $ = cheerio.load(response.data);
    const viewport = $('meta[name="viewport"]').attr('content');
    details.viewport = viewport;
    if (!viewport) {
      issues.push('Missing viewport meta tag (not mobile-friendly)');
      score -= 15;
    }

    return {
      score: Math.max(0, score),
      issues,
      details
    };
  } catch (error) {
    console.error('Error checking technical SEO:', error.message);
    return {
      score: 50,
      issues: [`Technical check failed: ${error.message}`],
      details: {}
    };
  }
}

/**
 * Check content quality
 */
async function checkContentQuality(url) {
  try {
    const response = await axios.get(url, { timeout: 10000 });
    const $ = cheerio.load(response.data);
    
    const issues = [];
    const details = {};
    let score = 100;

    // Get text content
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    const wordCount = bodyText.split(' ').length;
    details.wordCount = wordCount;

    if (wordCount < 300) {
      issues.push('Insufficient content (< 300 words)');
      score -= 20;
    } else if (wordCount < 600) {
      issues.push('Low content volume (< 600 words)');
      score -= 10;
    }

    // Check internal links
    const internalLinks = $('a[href^="/"], a[href^="' + url + '"]').length;
    details.internalLinks = internalLinks;
    if (internalLinks < 3) {
      issues.push('Few internal links (< 3)');
      score -= 10;
    }

    // Check external links
    const externalLinks = $('a[href^="http"]').not(`a[href^="${url}"]`).length;
    details.externalLinks = externalLinks;

    // Check heading structure
    const h2Count = $('h2').length;
    const h3Count = $('h3').length;
    details.headingStructure = { h2: h2Count, h3: h3Count };
    if (h2Count === 0) {
      issues.push('No H2 headings found');
      score -= 10;
    }

    // Check for duplicate content (simple check)
    const paragraphs = $('p').map((i, el) => $(el).text()).get();
    const uniqueParagraphs = new Set(paragraphs);
    if (paragraphs.length > uniqueParagraphs.size) {
      issues.push('Possible duplicate content detected');
      score -= 5;
    }

    return {
      score: Math.max(0, score),
      issues,
      details
    };
  } catch (error) {
    console.error('Error checking content quality:', error.message);
    return {
      score: 50,
      issues: [`Content check failed: ${error.message}`],
      details: {}
    };
  }
}

/**
 * Check performance
 */
async function checkPerformance(url) {
  try {
    const issues = [];
    const details = {};
    let score = 100;

    // Measure load time
    const startTime = Date.now();
    const response = await axios.get(url, { 
      timeout: 15000,
      maxRedirects: 5
    });
    const loadTime = Date.now() - startTime;
    details.loadTime = `${loadTime}ms`;

    if (loadTime > 3000) {
      issues.push(`Slow page load (${loadTime}ms)`);
      score -= 20;
    } else if (loadTime > 1500) {
      issues.push(`Moderate page load (${loadTime}ms)`);
      score -= 10;
    }

    // Check page size
    const pageSize = Buffer.byteLength(response.data);
    const pageSizeKB = Math.round(pageSize / 1024);
    details.pageSize = `${pageSizeKB}KB`;

    if (pageSizeKB > 3000) {
      issues.push(`Large page size (${pageSizeKB}KB)`);
      score -= 15;
    } else if (pageSizeKB > 1500) {
      issues.push(`Moderate page size (${pageSizeKB}KB)`);
      score -= 5;
    }

    // Check compression
    const contentEncoding = response.headers['content-encoding'];
    details.compression = contentEncoding || 'None';
    if (!contentEncoding || !contentEncoding.includes('gzip')) {
      issues.push('No GZIP compression detected');
      score -= 10;
    }

    // Check caching
    const cacheControl = response.headers['cache-control'];
    details.caching = cacheControl || 'None';
    if (!cacheControl) {
      issues.push('No cache headers found');
      score -= 10;
    }

    // Count resources
    const $ = cheerio.load(response.data);
    const scripts = $('script').length;
    const stylesheets = $('link[rel="stylesheet"]').length;
    const images = $('img').length;
    details.resources = { scripts, stylesheets, images };

    if (scripts > 20) {
      issues.push(`Too many scripts (${scripts})`);
      score -= 10;
    }

    return {
      score: Math.max(0, score),
      issues,
      details
    };
  } catch (error) {
    console.error('Error checking performance:', error.message);
    return {
      score: 50,
      issues: [`Performance check failed: ${error.message}`],
      details: {}
    };
  }
}

/**
 * Check security
 */
async function checkSecurity(url) {
  try {
    const issues = [];
    const details = {};
    let score = 100;

    const response = await axios.get(url, { timeout: 10000 });

    // Check HTTPS
    if (!url.startsWith('https://')) {
      issues.push('Not using HTTPS');
      score -= 30;
      details.https = false;
    } else {
      details.https = true;
    }

    // Check security headers
    const headers = response.headers;
    
    // X-Frame-Options
    if (!headers['x-frame-options']) {
      issues.push('Missing X-Frame-Options header');
      score -= 10;
    }

    // X-Content-Type-Options
    if (!headers['x-content-type-options']) {
      issues.push('Missing X-Content-Type-Options header');
      score -= 10;
    }

    // Strict-Transport-Security
    if (!headers['strict-transport-security']) {
      issues.push('Missing HSTS header');
      score -= 15;
    }

    // Content-Security-Policy
    if (!headers['content-security-policy']) {
      issues.push('Missing Content-Security-Policy header');
      score -= 10;
    }

    details.securityHeaders = {
      'X-Frame-Options': headers['x-frame-options'] || 'Missing',
      'X-Content-Type-Options': headers['x-content-type-options'] || 'Missing',
      'Strict-Transport-Security': headers['strict-transport-security'] || 'Missing',
      'Content-Security-Policy': headers['content-security-policy'] ? 'Present' : 'Missing'
    };

    // Check for mixed content
    const $ = cheerio.load(response.data);
    const httpResources = $('script[src^="http://"], link[href^="http://"], img[src^="http://"]').length;
    if (httpResources > 0) {
      issues.push(`${httpResources} insecure resources (HTTP) found`);
      score -= 15;
    }
    details.mixedContent = httpResources;

    return {
      score: Math.max(0, score),
      issues,
      details
    };
  } catch (error) {
    console.error('Error checking security:', error.message);
    return {
      score: 50,
      issues: [`Security check failed: ${error.message}`],
      details: {}
    };
  }
}

/**
 * Get status label based on score
 */
function getStatus(score) {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'fair';
  if (score >= 40) return 'poor';
  return 'critical';
}

/**
 * Generate prioritized action items
 */
function generateActionItems(issues, scores) {
  const actionItems = [];

  // Critical issues (score < 60)
  Object.entries(scores).forEach(([category, score]) => {
    if (score < 60) {
      actionItems.push({
        priority: 'high',
        title: `Improve ${category.replace(/([A-Z])/g, ' $1').trim()}`,
        description: `Score is ${score}/100 - requires immediate attention`,
        category
      });
    }
  });

  // Specific issue-based actions
  if (issues.some(i => i.includes('HTTPS'))) {
    actionItems.push({
      priority: 'critical',
      title: 'Enable HTTPS',
      description: 'Install SSL certificate and redirect all HTTP traffic to HTTPS',
      category: 'security'
    });
  }

  if (issues.some(i => i.includes('robots.txt'))) {
    actionItems.push({
      priority: 'high',
      title: 'Create robots.txt',
      description: 'Add robots.txt file to guide search engine crawlers',
      category: 'technical'
    });
  }

  if (issues.some(i => i.includes('sitemap'))) {
    actionItems.push({
      priority: 'high',
      title: 'Create XML Sitemap',
      description: 'Generate and submit sitemap.xml to search engines',
      category: 'technical'
    });
  }

  if (issues.some(i => i.includes('meta description'))) {
    actionItems.push({
      priority: 'medium',
      title: 'Optimize Meta Descriptions',
      description: 'Add or improve meta descriptions (120-160 characters)',
      category: 'onPage'
    });
  }

  if (issues.some(i => i.includes('alt text'))) {
    actionItems.push({
      priority: 'medium',
      title: 'Add Alt Text to Images',
      description: 'Improve accessibility and SEO by adding descriptive alt text',
      category: 'onPage'
    });
  }

  if (issues.some(i => i.includes('load') || i.includes('performance'))) {
    actionItems.push({
      priority: 'medium',
      title: 'Improve Page Speed',
      description: 'Optimize images, enable compression, and minimize resources',
      category: 'performance'
    });
  }

  // Limit to top 5 action items
  return actionItems.slice(0, 5);
}

module.exports = {
  runSEOHealthCheck
};

