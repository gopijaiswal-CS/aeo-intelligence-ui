/**
 * StackIQ Report Generator
 * Generates PDF reports with charts and analytics
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

export interface ReportData {
  profileName: string;
  websiteUrl: string;
  productName: string;
  region: string;
  analysisResult: {
    overallScore: number;
    mentions: number;
    seoHealth: number;
    citations: number;
    brokenLinks: number;
    trend: number[];
  };
  questions: any[];
  competitors: any[];
}

// Helper function to create a chart and return as image
async function createChartImage(config: ChartConfiguration, width: number, height: number): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const chart = new Chart(canvas, config);
  
  // Wait for chart to render
  await new Promise(resolve => setTimeout(resolve, 100));
  
  const imageData = canvas.toDataURL('image/png');
  chart.destroy();
  
  return imageData;
}

export async function generateStackIQReport(data: ReportData): Promise<void> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (2 * margin);

  // ============================================
  // PAGE 1: Title Page
  // ============================================
  
  // Header gradient (orange rectangle)
  pdf.setFillColor(255, 107, 0); // #FF6B00
  pdf.rect(0, 0, pageWidth, 60, 'F');

  // Title
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(32);
  pdf.setFont('helvetica', 'bold');
  pdf.text('STACKIQ', pageWidth / 2, 25, { align: 'center' });

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Answer Engine Optimization Report', pageWidth / 2, 40, { align: 'center' });

  // Main content
  pdf.setTextColor(51, 51, 51);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(data.productName, pageWidth / 2, 100, { align: 'center' });

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(102, 102, 102);
  pdf.text(data.websiteUrl, pageWidth / 2, 115, { align: 'center' });

  pdf.setFontSize(11);
  pdf.setTextColor(136, 136, 136);
  pdf.text(`Region: ${data.region.toUpperCase()}`, pageWidth / 2, 127, { align: 'center' });

  // Footer
  pdf.setFontSize(10);
  pdf.setTextColor(153, 153, 153);
  const dateStr = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  pdf.text(`Generated on ${dateStr}`, pageWidth / 2, pageHeight - 30, { align: 'center' });

  // ============================================
  // PAGE 2: Executive Summary
  // ============================================
  pdf.addPage();

  // Header
  pdf.setFillColor(249, 250, 251);
  pdf.rect(0, 0, pageWidth, 30, 'F');
  pdf.setTextColor(51, 51, 51);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Executive Summary', margin, 20);

  // Key Metrics Cards
  const metrics = [
    { label: 'AI Visibility Score', value: `${data.analysisResult.overallScore}%`, color: [255, 107, 0] },
    { label: 'Total Mentions', value: data.analysisResult.mentions.toString(), color: [124, 58, 237] },
    { label: 'SEO Health', value: `${data.analysisResult.seoHealth}%`, color: [16, 185, 129] },
    { label: 'Citations', value: data.analysisResult.citations.toString(), color: [59, 130, 246] },
  ];

  let xPos = margin;
  const cardWidth = (contentWidth - 10) / 4;
  const yPos = 45;

  metrics.forEach((metric) => {
    // Card background
    pdf.setFillColor(249, 250, 251);
    pdf.setDrawColor(229, 231, 235);
    pdf.rect(xPos, yPos, cardWidth, 25, 'FD');

    // Value
    pdf.setTextColor(metric.color[0], metric.color[1], metric.color[2]);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(metric.value, xPos + cardWidth / 2, yPos + 12, { align: 'center' });

    // Label
    pdf.setTextColor(102, 102, 102);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    const labelLines = pdf.splitTextToSize(metric.label, cardWidth - 4);
    pdf.text(labelLines, xPos + cardWidth / 2, yPos + 20, { align: 'center' });

    xPos += cardWidth + 3;
  });

  // Summary text
  pdf.setTextColor(51, 51, 51);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  
  const summaryLines = [
    `Your product "${data.productName}" has a visibility score of ${data.analysisResult.overallScore}% across major AI platforms.`,
    '',
    `• Total AI Mentions: ${data.analysisResult.mentions}`,
    `• Citation Count: ${data.analysisResult.citations}`,
    `• SEO Health Score: ${data.analysisResult.seoHealth}%`,
    `• Questions Tested: ${data.questions.length}`,
    `• Competitors Tracked: ${data.competitors.length}`,
  ];

  let textY = 85;
  summaryLines.forEach(line => {
    pdf.text(line, margin, textY);
    textY += 8;
  });

  // ============================================
  // PAGE 3: AI Visibility Score (Donut Chart)
  // ============================================
  pdf.addPage();

  // Header
  pdf.setFillColor(249, 250, 251);
  pdf.rect(0, 0, pageWidth, 30, 'F');
  pdf.setTextColor(51, 51, 51);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Overall AI Visibility Score', margin, 20);

  // Create donut chart
  const donutConfig: ChartConfiguration = {
    type: 'doughnut',
    data: {
      labels: ['Visible', 'Not Visible'],
      datasets: [{
        data: [data.analysisResult.overallScore, 100 - data.analysisResult.overallScore],
        backgroundColor: ['#FF6B00', '#E5E7EB'],
        borderWidth: 0,
      }],
    },
    options: {
      responsive: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            font: { size: 14 },
            padding: 15,
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => `${context.label}: ${context.parsed}%`
          }
        }
      },
      cutout: '70%',
    },
  };

  const donutImage = await createChartImage(donutConfig, 600, 600);
  pdf.addImage(donutImage, 'PNG', margin + 20, 50, contentWidth - 40, contentWidth - 40);

  // Score interpretation
  pdf.setFontSize(36);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(255, 107, 0);
  pdf.text(`${data.analysisResult.overallScore}%`, pageWidth / 2, pageHeight - 80, { align: 'center' });

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(102, 102, 102);
  pdf.text('Visibility Score', pageWidth / 2, pageHeight - 65, { align: 'center' });

  // ============================================
  // PAGE 4: 7-Day Trend Chart
  // ============================================
  pdf.addPage();

  // Header
  pdf.setFillColor(249, 250, 251);
  pdf.rect(0, 0, pageWidth, 30, 'F');
  pdf.setTextColor(51, 51, 51);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Visibility Trend (7 Days)', margin, 20);

  // Create line chart
  const lineConfig: ChartConfiguration = {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Visibility Score',
        data: data.analysisResult.trend,
        borderColor: '#FF6B00',
        backgroundColor: 'rgba(255, 107, 0, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointBackgroundColor: '#FF6B00',
      }],
    },
    options: {
      responsive: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: (value) => `${value}%`,
            font: { size: 12 }
          },
          grid: { color: '#E5E7EB' }
        },
        x: {
          ticks: { font: { size: 12 } },
          grid: { display: false }
        }
      }
    },
  };

  const lineImage = await createChartImage(lineConfig, 800, 400);
  pdf.addImage(lineImage, 'PNG', margin, 45, contentWidth, 100);

  // Trend insight
  const trendChange = data.analysisResult.trend[6] - data.analysisResult.trend[0];
  const trendDirection = trendChange > 0 ? '📈' : trendChange < 0 ? '📉' : '➡️';
  const trendColor = trendChange > 0 ? [16, 185, 129] : trendChange < 0 ? [239, 68, 68] : [102, 102, 102];
  
  pdf.setTextColor(trendColor[0], trendColor[1], trendColor[2]);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(
    `${trendDirection} ${trendChange > 0 ? '+' : ''}${trendChange.toFixed(1)}% change over 7 days`,
    pageWidth / 2,
    165,
    { align: 'center' }
  );

  // ============================================
  // PAGE 5: LLM Performance Breakdown
  // ============================================
  pdf.addPage();

  // Header
  pdf.setFillColor(249, 250, 251);
  pdf.rect(0, 0, pageWidth, 30, 'F');
  pdf.setTextColor(51, 51, 51);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Performance by AI Platform', margin, 20);

  // Create bar chart
  const barConfig: ChartConfiguration = {
    type: 'bar',
    data: {
      labels: ['ChatGPT', 'Claude', 'Gemini', 'Perplexity'],
      datasets: [{
        label: 'Visibility Score',
        data: [82, 76, 71, 68],
        backgroundColor: [
          '#10B981', // green
          '#7C3AED', // purple
          '#3B82F6', // blue
          '#F59E0B', // orange
        ],
        borderWidth: 0,
      }],
    },
    options: {
      responsive: false,
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: (value) => `${value}%`,
            font: { size: 12 }
          },
          grid: { color: '#E5E7EB' }
        },
        y: {
          ticks: { font: { size: 12 } },
          grid: { display: false }
        }
      }
    },
  };

  const barImage = await createChartImage(barConfig, 800, 400);
  pdf.addImage(barImage, 'PNG', margin, 45, contentWidth, 100);

  // ============================================
  // PAGE 6: Top Competitors
  // ============================================
  pdf.addPage();

  // Header
  pdf.setFillColor(249, 250, 251);
  pdf.rect(0, 0, pageWidth, 30, 'F');
  pdf.setTextColor(51, 51, 51);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Competitor Analysis', margin, 20);

  // Table
  const tableData = data.competitors.slice(0, 10).map(c => [
    `#${c.rank}`,
    c.name,
    c.mentions.toString(),
    c.citations.toString(),
    `${c.visibility}%`,
  ]);

  autoTable(pdf, {
    startY: 40,
    head: [['Rank', 'Competitor', 'Mentions', 'Citations', 'Visibility']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [255, 107, 0],
      textColor: [255, 255, 255],
      fontSize: 11,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 20 },
      1: { cellWidth: 'auto' },
      2: { halign: 'center', cellWidth: 25 },
      3: { halign: 'center', cellWidth: 25 },
      4: { halign: 'center', cellWidth: 25 },
    },
  });

  // ============================================
  // PAGE 7: Key Recommendations
  // ============================================
  pdf.addPage();

  // Header
  pdf.setFillColor(249, 250, 251);
  pdf.rect(0, 0, pageWidth, 30, 'F');
  pdf.setTextColor(51, 51, 51);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Key Recommendations', margin, 20);

  const recommendations = [
    {
      priority: 'HIGH',
      title: 'Increase Content Depth',
      description: 'Add detailed product specifications and technical documentation to improve citation quality.',
      color: [239, 68, 68],
    },
    {
      priority: 'MEDIUM',
      title: 'Optimize Question Coverage',
      description: 'Expand into underperforming categories like Technical and How-To queries.',
      color: [245, 158, 11],
    },
    {
      priority: 'MEDIUM',
      title: 'Build Authoritative Citations',
      description: 'Focus on getting mentions from high-weight sources (8.0+ citation weight).',
      color: [245, 158, 11],
    },
    {
      priority: 'LOW',
      title: 'Fix Technical Issues',
      description: `Address ${data.analysisResult.brokenLinks} broken links found during analysis.`,
      color: [59, 130, 246],
    },
  ];

  let recY = 45;
  recommendations.forEach((rec) => {
    // Priority badge
    pdf.setFillColor(rec.color[0], rec.color[1], rec.color[2]);
    pdf.rect(margin, recY, 25, 8, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.text(rec.priority, margin + 12.5, recY + 5.5, { align: 'center' });

    // Title
    pdf.setTextColor(51, 51, 51);
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.text(rec.title, margin + 30, recY + 6);

    // Description
    pdf.setTextColor(102, 102, 102);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const descLines = pdf.splitTextToSize(rec.description, contentWidth - 35);
    pdf.text(descLines, margin + 30, recY + 14);

    recY += 30;
  });

  // ============================================
  // PAGE 8: Next Steps
  // ============================================
  pdf.addPage();

  // Header
  pdf.setFillColor(249, 250, 251);
  pdf.rect(0, 0, pageWidth, 30, 'F');
  pdf.setTextColor(51, 51, 51);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Next Steps', margin, 20);

  const nextSteps = [
    '1. Implement high-priority recommendations within the next 2 weeks',
    '2. Monitor visibility score changes after implementing optimizations',
    '3. Re-run analysis monthly to track progress',
    '4. Focus on improving performance in underperforming LLMs',
    '5. Continue building authoritative citations from high-weight sources',
  ];

  pdf.setTextColor(51, 51, 51);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  
  let stepY = 50;
  nextSteps.forEach(step => {
    const lines = pdf.splitTextToSize(step, contentWidth - 10);
    pdf.text(lines, margin + 5, stepY);
    stepY += 15;
  });

  // Footer with branding
  pdf.setFontSize(11);
  pdf.setTextColor(153, 153, 153);
  pdf.text('StackIQ Platform', pageWidth / 2, pageHeight - 30, { align: 'center' });

  pdf.setFontSize(9);
  pdf.setTextColor(187, 187, 187);
  pdf.text('Dominate AI Search Results', pageWidth / 2, pageHeight - 22, { align: 'center' });

  // Generate and download
  const fileName = `StackIQ_Report_${data.productName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(fileName);
}
