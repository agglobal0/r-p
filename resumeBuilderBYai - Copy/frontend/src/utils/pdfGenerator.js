// utils/pdfGenerator.js
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export class ResumePDFGenerator {
  constructor(resumeData, style = {}) {
    this.data = resumeData;
    this.style = {
      primaryColor: this.hexToRgb(style.primaryColor || '#2563eb'),
      font: style.font || 'Helvetica',
      fontSize: {
        name: 24,
        heading: 14,
        subheading: 12,
        body: 10,
        small: 9
      },
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      },
      spacing: {
        section: 15,
        paragraph: 8,
        line: 12
      }
    };
    this.pageHeight = 792; // Letter size height
    this.pageWidth = 612;  // Letter size width
    this.currentY = this.pageHeight - this.style.margins.top;
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255,
    } : { r: 0.15, g: 0.4, b: 0.9 }; // Default blue
  }

  async generatePDF() {
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([this.pageWidth, this.pageHeight]);
    
    // Set font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    this.currentY = this.pageHeight - this.style.margins.top;

    // Generate each section
    this.drawPersonalInfo(page, font, boldFont);
    this.drawSummary(page, font, boldFont);
    this.drawSkills(page, font, boldFont);
    this.drawExperience(page, font, boldFont);
    this.drawProjects(page, font, boldFont);
    this.drawEducation(page, font, boldFont);

    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  }

  drawPersonalInfo(page, font, boldFont) {
    const { personalInfo } = this.data;
    
    // Name
    page.drawText(personalInfo.name, {
      x: this.style.margins.left,
      y: this.currentY,
      size: this.style.fontSize.name,
      font: boldFont,
      color: rgb(this.style.primaryColor.r, this.style.primaryColor.g, this.style.primaryColor.b)
    });
    
    this.currentY -= this.style.fontSize.name + 5;

    // Contact info line
    const contactInfo = [personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean).join(' • ');
    page.drawText(contactInfo, {
      x: this.style.margins.left,
      y: this.currentY,
      size: this.style.fontSize.body,
      font: font,
      color: rgb(0.4, 0.4, 0.4)
    });

    this.currentY -= this.style.fontSize.body + 3;

    // Links
    const links = [personalInfo.linkedin, personalInfo.portfolio].filter(Boolean).join(' • ');
    if (links) {
      page.drawText(links, {
        x: this.style.margins.left,
        y: this.currentY,
        size: this.style.fontSize.body,
        font: font,
        color: rgb(this.style.primaryColor.r, this.style.primaryColor.g, this.style.primaryColor.b)
      });
    }

    this.currentY -= this.style.spacing.section;
  }

  drawSummary(page, font, boldFont) {
    this.drawSectionHeader(page, boldFont, 'PROFESSIONAL SUMMARY');
    
    const summaryLines = this.wrapText(this.data.summary, font, this.style.fontSize.body, 
      this.pageWidth - this.style.margins.left - this.style.margins.right);
    
    summaryLines.forEach(line => {
      page.drawText(line, {
        x: this.style.margins.left,
        y: this.currentY,
        size: this.style.fontSize.body,
        font: font,
        color: rgb(0.2, 0.2, 0.2)
      });
      this.currentY -= this.style.spacing.line;
    });

    this.currentY -= this.style.spacing.section;
  }

  drawSkills(page, font, boldFont) {
    this.drawSectionHeader(page, boldFont, 'TECHNICAL SKILLS');
    
    const skillsText = this.data.skills.technical.join(' • ');
    const skillsLines = this.wrapText(skillsText, font, this.style.fontSize.body,
      this.pageWidth - this.style.margins.left - this.style.margins.right);
    
    skillsLines.forEach(line => {
      page.drawText(line, {
        x: this.style.margins.left,
        y: this.currentY,
        size: this.style.fontSize.body,
        font: font,
        color: rgb(0.2, 0.2, 0.2)
      });
      this.currentY -= this.style.spacing.line;
    });

    this.currentY -= this.style.spacing.section;
  }

  drawExperience(page, font, boldFont) {
    this.drawSectionHeader(page, boldFont, 'PROFESSIONAL EXPERIENCE');
    
    this.data.experience.forEach(exp => {
      // Position and Company
      page.drawText(exp.position, {
        x: this.style.margins.left,
        y: this.currentY,
        size: this.style.fontSize.subheading,
        font: boldFont,
        color: rgb(0.1, 0.1, 0.1)
      });

      // Duration (right aligned)
      const durationWidth = font.widthOfTextAtSize(exp.duration, this.style.fontSize.body);
      page.drawText(exp.duration, {
        x: this.pageWidth - this.style.margins.right - durationWidth,
        y: this.currentY,
        size: this.style.fontSize.body,
        font: font,
        color: rgb(0.4, 0.4, 0.4)
      });

      this.currentY -= this.style.fontSize.subheading + 2;

      // Company and location
      page.drawText(`${exp.company} • ${exp.location}`, {
        x: this.style.margins.left,
        y: this.currentY,
        size: this.style.fontSize.body,
        font: font,
        color: rgb(0.4, 0.4, 0.4)
      });

      this.currentY -= this.style.fontSize.body + 5;

      // Bullets
      exp.bullets.forEach(bullet => {
        const bulletLines = this.wrapText(`• ${bullet}`, font, this.style.fontSize.body,
          this.pageWidth - this.style.margins.left - this.style.margins.right);
        
        bulletLines.forEach((line, index) => {
          page.drawText(line, {
            x: this.style.margins.left + (index > 0 ? 10 : 0), // Indent continuation lines
            y: this.currentY,
            size: this.style.fontSize.body,
            font: font,
            color: rgb(0.2, 0.2, 0.2)
          });
          this.currentY -= this.style.spacing.line;
        });
      });

      this.currentY -= this.style.spacing.paragraph;
    });

    this.currentY -= this.style.spacing.section;
  }

  drawProjects(page, font, boldFont) {
    if (!this.data.projects || this.data.projects.length === 0) return;

    this.drawSectionHeader(page, boldFont, 'KEY PROJECTS');
    
    this.data.projects.forEach(project => {
      // Project name
      page.drawText(project.name, {
        x: this.style.margins.left,
        y: this.currentY,
        size: this.style.fontSize.subheading,
        font: boldFont,
        color: rgb(0.1, 0.1, 0.1)
      });

      this.currentY -= this.style.fontSize.subheading + 2;

      // Description
      const descLines = this.wrapText(project.description, font, this.style.fontSize.body,
        this.pageWidth - this.style.margins.left - this.style.margins.right);
      
      descLines.forEach(line => {
        page.drawText(line, {
          x: this.style.margins.left,
          y: this.currentY,
          size: this.style.fontSize.body,
          font: font,
          color: rgb(0.2, 0.2, 0.2)
        });
        this.currentY -= this.style.spacing.line;
      });

      // Technologies
      if (project.technologies && project.technologies.length > 0) {
        const techText = `Technologies: ${project.technologies.join(', ')}`;
        page.drawText(techText, {
          x: this.style.margins.left,
          y: this.currentY,
          size: this.style.fontSize.small,
          font: font,
          color: rgb(0.4, 0.4, 0.4)
        });
        this.currentY -= this.style.fontSize.small + 3;
      }

      this.currentY -= this.style.spacing.paragraph;
    });

    this.currentY -= this.style.spacing.section;
  }

  drawEducation(page, font, boldFont) {
    if (!this.data.education || this.data.education.length === 0) return;

    this.drawSectionHeader(page, boldFont, 'EDUCATION');
    
    this.data.education.forEach(edu => {
      // Degree
      page.drawText(edu.degree, {
        x: this.style.margins.left,
        y: this.currentY,
        size: this.style.fontSize.subheading,
        font: boldFont,
        color: rgb(0.1, 0.1, 0.1)
      });

      // Duration (right aligned)
      const durationWidth = font.widthOfTextAtSize(edu.duration, this.style.fontSize.body);
      page.drawText(edu.duration, {
        x: this.pageWidth - this.style.margins.right - durationWidth,
        y: this.currentY,
        size: this.style.fontSize.body,
        font: font,
        color: rgb(0.4, 0.4, 0.4)
      });

      this.currentY -= this.style.fontSize.subheading + 2;

      // Institution
      let institutionText = edu.institution;
      if (edu.gpa) {
        institutionText += ` • GPA: ${edu.gpa}`;
      }

      page.drawText(institutionText, {
        x: this.style.margins.left,
        y: this.currentY,
        size: this.style.fontSize.body,
        font: font,
        color: rgb(0.4, 0.4, 0.4)
      });

      this.currentY -= this.style.fontSize.body + 5;
      this.currentY -= this.style.spacing.paragraph;
    });
  }

  drawSectionHeader(page, boldFont, title) {
    // Section title
    page.drawText(title, {
      x: this.style.margins.left,
      y: this.currentY,
      size: this.style.fontSize.heading,
      font: boldFont,
      color: rgb(this.style.primaryColor.r, this.style.primaryColor.g, this.style.primaryColor.b)
    });

    // Underline
    page.drawLine({
      start: { x: this.style.margins.left, y: this.currentY - 3 },
      end: { x: this.pageWidth - this.style.margins.right, y: this.currentY - 3 },
      thickness: 1,
      color: rgb(this.style.primaryColor.r, this.style.primaryColor.g, this.style.primaryColor.b)
    });

    this.currentY -= this.style.fontSize.heading + 8;
  }

  wrapText(text, font, fontSize, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);
      
      if (testWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          // Word is longer than max width, just add it
          lines.push(word);
        }
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }
}

// React hook for PDF generation
export const usePDFGenerator = () => {
  const generateAndDownloadPDF = async (resumeData, style, filename = 'resume.pdf') => {
    try {
      const generator = new ResumePDFGenerator(resumeData, style);
      const pdfBytes = await generator.generatePDF();
      
      // Create blob and download
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('PDF generation error:', error);
      return false;
    }
  };

  return { generateAndDownloadPDF };
};