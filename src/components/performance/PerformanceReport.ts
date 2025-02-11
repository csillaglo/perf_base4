import jsPDF from 'jspdf';
import i18next from 'i18next';
import type { Goal, Profile } from '../../types/database';

interface GenerateReportProps {
  user: Profile;
  goals: Goal[];
  performanceScore: number;
  gradeText: string;
  gradeLevel: number;
}

export function generatePerformanceReport({
  user,
  goals,
  performanceScore,
  gradeText,
  gradeLevel,
}: GenerateReportProps): void {
  // Create new PDF document
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Helper function to center text
  const centerText = (text: string, y: number) => {
    const textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    const x = (pageWidth - textWidth) / 2;
    doc.text(text, x, y);
  };

  // Add header
  doc.setFontSize(20);
  centerText(i18next.t('goals.evaluation.report.title'), 20);

  // Add user info
  doc.setFontSize(12);
  doc.text(i18next.t('goals.evaluation.report.employeeInfo'), 20, 35);
  doc.setFontSize(10);
  doc.text(`${i18next.t('profile.fullName')}: ${user.full_name || i18next.t('common.na')}`, 25, 45);
  doc.text(`${i18next.t('profile.department')}: ${user.department || i18next.t('common.na')}`, 25, 50);
  doc.text(`${i18next.t('profile.jobName')}: ${user.job_name || i18next.t('common.na')}`, 25, 55);
  doc.text(`${i18next.t('profile.jobLevel')}: ${user.job_level || i18next.t('common.na')}`, 25, 60);

  // Add performance score
  doc.setFontSize(12);
  doc.text(i18next.t('goals.evaluation.performance.title') + ':', 20, 75);
  doc.setFontSize(16);
  const [r, g, b] = getScoreColor(performanceScore);
  doc.setTextColor(r/255, g/255, b/255);
  doc.text(`${performanceScore}%`, 25, 85);
  doc.setTextColor(0, 0, 0); // Reset to black
  doc.setFontSize(12);
  doc.text(`${i18next.t('goals.evaluation.performance.grade')}: ${gradeText} (${i18next.t('goals.evaluation.performance.level')} ${gradeLevel})`, 25, 95);

  // Add goals section
  doc.text('Goals and Impact:', 20, 110);
  doc.setFontSize(10);
  
  let yPos = 120;
  goals.forEach((goal, index) => {
    // Check if we need a new page
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }

    const impact = Math.round(((goal.evaluation_score || 1) / 5 * 100) * (goal.weight || 0) / 100);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text(`${index + 1}. ${goal.title}`, 25, yPos);
    doc.setFont(undefined, 'normal');
    
    yPos += 5;
    if (goal.description) {
      const lines = doc.splitTextToSize(goal.description, 160);
      doc.text(lines, 30, yPos + 5);
      yPos += 5 * lines.length;
    }
    
    doc.text(`${i18next.t('goals.status.title')}: ${formatStatus(goal.status)}`, 30, yPos + 5);
    doc.text(`${i18next.t('goals.weight')}: ${goal.weight}%`, 30, yPos + 10);
    doc.text(`${i18next.t('goals.evaluation.score')}: ${goal.evaluation_score || 1}/5`, 30, yPos + 15);
    doc.text(`${i18next.t('goals.evaluation.impact.impact')}: ${impact}%`, 30, yPos + 20);
    
    yPos += 30;
  });

  // Save the PDF
  doc.save(`${i18next.t('goals.evaluation.report.filename')}_${user.full_name || i18next.t('goals.evaluation.report.employee')}.pdf`);
}

function getScoreColor(score: number): number[] {
  if (score >= 81) return [46, 124, 46]; // Green
  if (score >= 61) return [37, 99, 235]; // Blue
  if (score >= 41) return [202, 138, 4];  // Yellow
  if (score >= 21) return [234, 88, 12];  // Orange
  return [220, 38, 38]; // Red
}

function formatStatus(status: string): string {
  return status
    .split('_')
    .map(word => i18next.t(`goals.status.${word}`))
    .join(' ');
}