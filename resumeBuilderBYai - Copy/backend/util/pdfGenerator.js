// util/pdfGenerator.js - Complete React-PDF generator
const React = require('react');
const { Document, Page, Text, View, StyleSheet, Font, pdf } = require('@react-pdf/renderer');

// Register fonts for better typography
Font.register({
  family: 'Inter',
  fonts: [
    { 
      src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2',
      fontWeight: 'normal'
    },
    { 
      src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2', 
      fontWeight: 'bold'
    }
  ]
});

// PDF Styles
const createStyles = (theme = { primary: '#2563eb' }) => StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Inter',
    fontSize: 10,
    lineHeight: 1.4,
    color: '#1f2937'
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: theme.primary
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.primary,
    marginBottom: 8
  },
  contact: {
    fontSize: 10,
    color: '#6b7280',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  section: {
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.primary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  text: {
    fontSize: 10,
    color: '#374151',
    lineHeight: 1.5
  },
  experienceItem: {
    marginBottom: 12
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  jobTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#111827'
  },
  duration: {
    fontSize: 9,
    color: '#6b7280'
  },
  company: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 4
  },
  achievementsList: {
    marginLeft: 10
  },
  achievement: {
    fontSize: 10,
    color: '#374151',
    marginBottom: 2,
    flexDirection: 'row'
  },
  bullet: {
    marginRight: 6,
    color: theme.primary,
    fontWeight: 'bold'
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4
  },
  skillItem: {
    backgroundColor: '#f3f4f6',
    padding: '4 8',
    marginRight: 6,
    marginBottom: 4,
    fontSize: 9,
    color: '#374151',
    borderRadius: 2
  },
  educationItem: {
    marginBottom: 8
  },
  degree: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#111827'
  },
  institution: {
    fontSize: 10,
    color: '#6b7280'
  },
  subSectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
    marginTop: 4
  }
});

// React-PDF Document Component
const ResumeDocument = ({ data, theme = { primary: '#2563eb' } }) => {
  const styles = createStyles(theme);

  return React.createElement(Document, null,
    React.createElement(Page, { size: "A4", style: styles.page },
      // Header Section
      React.createElement(View, { style: styles.header },
        React.createElement(Text, { style: styles.name }, 
          data.personalInfo?.name || 'Professional Name'
        ),
        React.createElement(Text, { style: styles.contact },
          `${data.personalInfo?.email || 'email@example.com'} • ${data.personalInfo?.phone || '+1 (555) 123-4567'} • ${data.personalInfo?.location || 'City, State'}`
        )
      ),

      // Professional Summary
      data.summary && React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'PROFESSIONAL SUMMARY'),
        React.createElement(Text, { style: styles.text }, data.summary)
      ),

      // Skills Section
      (data.skills?.technical?.length || data.skills?.soft?.length || data.skills?.tools?.length) && 
      React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'SKILLS'),
        
        // Technical Skills
        data.skills?.technical?.length && React.createElement(View, null,
          React.createElement(Text, { style: styles.subSectionTitle }, 'Technical Skills'),
          React.createElement(View, { style: styles.skillsGrid },
            ...data.skills.technical.map((skill, i) => 
              React.createElement(Text, { key: i, style: styles.skillItem }, skill)
            )
          )
        ),
        
        // Soft Skills
        data.skills?.soft?.length && React.createElement(View, { style: { marginTop: 8 } },
          React.createElement(Text, { style: styles.subSectionTitle }, 'Soft Skills'),
          React.createElement(View, { style: styles.skillsGrid },
            ...data.skills.soft.map((skill, i) => 
              React.createElement(Text, { key: i, style: styles.skillItem }, skill)
            )
          )
        ),

        // Tools/Technologies
        data.skills?.tools?.length && React.createElement(View, { style: { marginTop: 8 } },
          React.createElement(Text, { style: styles.subSectionTitle }, 'Tools & Technologies'),
          React.createElement(View, { style: styles.skillsGrid },
            ...data.skills.tools.map((tool, i) => 
              React.createElement(Text, { key: i, style: styles.skillItem }, tool)
            )
          )
        )
      ),

      // Experience Section
      data.experience?.length && React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'EXPERIENCE'),
        ...data.experience.map((exp, i) =>
          React.createElement(View, { key: i, style: styles.experienceItem },
            React.createElement(View, { style: styles.experienceHeader },
              React.createElement(Text, { style: styles.jobTitle }, exp.role || 'Job Title'),
              React.createElement(Text, { style: styles.duration }, exp.duration || 'Duration')
            ),
            React.createElement(Text, { style: styles.company }, exp.company || 'Company Name'),
            exp.achievements?.length && React.createElement(View, { style: styles.achievementsList },
              ...exp.achievements.map((achievement, j) =>
                React.createElement(View, { key: j, style: styles.achievement },
                  React.createElement(Text, { style: styles.bullet }, '•'),
                  React.createElement(Text, null, achievement)
                )
              )
            )
          )
        )
      ),

      // Education Section
      data.education?.length && React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'EDUCATION'),
        ...data.education.map((edu, i) =>
          React.createElement(View, { key: i, style: styles.educationItem },
            React.createElement(View, { style: styles.experienceHeader },
              React.createElement(Text, { style: styles.degree }, edu.degree || 'Degree'),
              React.createElement(Text, { style: styles.duration }, edu.year || 'Year')
            ),
            React.createElement(Text, { style: styles.institution }, edu.institution || 'Institution')
          )
        )
      ),

      // Projects Section
      data.projects?.length && React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'PROJECTS'),
        ...data.projects.map((project, i) =>
          React.createElement(View, { key: i, style: { marginBottom: 8 } },
            React.createElement(Text, { style: styles.jobTitle }, project.title || 'Project Title'),
            React.createElement(Text, { style: styles.text }, project.description || 'Project description'),
            project.technologies?.length && React.createElement(View, { style: { ...styles.skillsGrid, marginTop: 4 } },
              ...project.technologies.map((tech, j) =>
                React.createElement(Text, { key: j, style: styles.skillItem }, tech)
              )
            )
          )
        )
      ),

      // Certifications Section
      data.certifications?.length && React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, 'CERTIFICATIONS'),
        ...data.certifications.map((cert, i) =>
          React.createElement(View, { key: i, style: styles.achievement },
            React.createElement(Text, { style: styles.bullet }, '•'),
            React.createElement(Text, { style: styles.text }, cert)
          )
        )
      )
    )
  );
};

// PDF Generation Function
async function generatePDFBuffer(resumeData, theme = { primary: '#2563eb' }) {
  try {
    console.log('Generating PDF with React-PDF...');
    
    const doc = React.createElement(ResumeDocument, { data: resumeData, theme });
    const pdfBuffer = await pdf(doc).toBuffer();
    
    console.log(`PDF generated successfully. Size: ${pdfBuffer.length} bytes`);
    return pdfBuffer;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error(`PDF generation failed: ${error.message}`);
  }
}

// Helper function to generate HTML resume
function generateHTMLResume(data, theme = { primary: '#2563eb' }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.personalInfo?.name || 'Resume'}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @media print { 
            body { -webkit-print-color-adjust: exact; }
            .no-print { display: none; }
        }
        .primary-color { color: ${theme.primary}; }
        .primary-border { border-color: ${theme.primary}; }
        .primary-bg { background-color: ${theme.primary}; }
    </style>
</head>
<body class="bg-white text-gray-800 font-sans leading-relaxed">
    <div class="max-w-4xl mx-auto p-8">
        <!-- Header -->
        <header class="text-center mb-8 pb-6 border-b-2 primary-border">
            <h1 class="text-3xl font-bold primary-color mb-2">${data.personalInfo?.name || 'Your Name'}</h1>
            <div class="text-sm text-gray-600">
                ${data.personalInfo?.email || ''} • 
                ${data.personalInfo?.phone || ''} • 
                ${data.personalInfo?.location || ''}
            </div>
        </header>

        <!-- Summary -->
        ${data.summary ? `
        <section class="mb-8">
            <h2 class="text-lg font-semibold primary-color mb-3 uppercase tracking-wide">Professional Summary</h2>
            <p class="text-gray-700 leading-relaxed">${data.summary}</p>
        </section>
        ` : ''}

        <!-- Skills -->
        ${data.skills?.technical?.length || data.skills?.soft?.length || data.skills?.tools?.length ? `
        <section class="mb-8">
            <h2 class="text-lg font-semibold primary-color mb-3 uppercase tracking-wide">Skills</h2>
            ${data.skills?.technical?.length ? `
                <div class="mb-4">
                    <h3 class="font-medium text-gray-800 mb-2">Technical Skills</h3>
                    <div class="grid grid-cols-2 gap-2">
                        ${data.skills.technical.map(skill => `<div class="text-gray-700">• ${skill}</div>`).join('')}
                    </div>
                </div>
            ` : ''}
            ${data.skills?.soft?.length ? `
                <div class="mb-4">
                    <h3 class="font-medium text-gray-800 mb-2">Soft Skills</h3>
                    <div class="grid grid-cols-2 gap-2">
                        ${data.skills.soft.map(skill => `<div class="text-gray-700">• ${skill}</div>`).join('')}
                    </div>
                </div>
            ` : ''}
            ${data.skills?.tools?.length ? `
                <div class="mb-4">
                    <h3 class="font-medium text-gray-800 mb-2">Tools & Technologies</h3>
                    <div class="grid grid-cols-2 gap-2">
                        ${data.skills.tools.map(tool => `<div class="text-gray-700">• ${tool}</div>`).join('')}
                    </div>
                </div>
            ` : ''}
        </section>
        ` : ''}

        <!-- Experience -->
        ${data.experience?.length ? `
        <section class="mb-8">
            <h2 class="text-lg font-semibold primary-color mb-3 uppercase tracking-wide">Experience</h2>
            ${data.experience.map(exp => `
                <div class="mb-6">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-semibold text-gray-800">${exp.role || 'Job Title'}</h3>
                        <span class="text-gray-600 text-sm">${exp.duration || 'Duration'}</span>
                    </div>
                    <div class="text-gray-600 mb-2">${exp.company || 'Company Name'}</div>
                    ${exp.achievements?.length ? `
                        <ul class="ml-4">
                            ${exp.achievements.map(achievement => `<li class="text-gray-700 mb-1">• ${achievement}</li>`).join('')}
                        </ul>
                    ` : ''}
                </div>
            `).join('')}
        </section>
        ` : ''}

        <!-- Education -->
        ${data.education?.length ? `
        <section class="mb-8">
            <h2 class="text-lg font-semibold primary-color mb-3 uppercase tracking-wide">Education</h2>
            ${data.education.map(edu => `
                <div class="mb-3">
                    <div class="flex justify-between items-start">
                        <div>
                            <div class="font-semibold text-gray-800">${edu.degree || 'Degree'}</div>
                            <div class="text-gray-600">${edu.institution || 'Institution'}</div>
                        </div>
                        <span class="text-gray-600 text-sm">${edu.year || 'Year'}</span>
                    </div>
                </div>
            `).join('')}
        </section>
        ` : ''}

        <!-- Projects -->
        ${data.projects?.length ? `
        <section class="mb-8">
            <h2 class="text-lg font-semibold primary-color mb-3 uppercase tracking-wide">Projects</h2>
            ${data.projects.map(project => `
                <div class="mb-4">
                    <h3 class="font-semibold text-gray-800 mb-1">${project.title || 'Project Title'}</h3>
                    <p class="text-gray-700">${project.description || 'Project description'}</p>
                    ${project.technologies?.length ? `
                        <div class="mt-2">
                            <span class="text-sm text-gray-600">Technologies: ${project.technologies.join(', ')}</span>
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </section>
        ` : ''}

        <!-- Certifications -->
        ${data.certifications?.length ? `
        <section class="mb-8">
            <h2 class="text-lg font-semibold primary-color mb-3 uppercase tracking-wide">Certifications</h2>
            <div class="grid grid-cols-1 gap-2">
                ${data.certifications.map(cert => `<div class="text-gray-700">• ${cert}</div>`).join('')}
            </div>
        </section>
        ` : ''}
    </div>
</body>
</html>`;
}

// Enhanced Resume Layout with PDF capability
function generateResumeLayout(data, theme = { primary: '#2563eb' }) {
  const htmlContent = generateHTMLResume(data, theme);
  
  return {
    template: "ats_friendly",
    data: data,
    htmlContent: htmlContent,
    theme: theme,
    // PDF generation function
    generatePDF: () => generatePDFBuffer(data, theme)
  };
}

module.exports = {
  ResumeDocument,
  generatePDFBuffer,
  generateResumeLayout,
  generateHTMLResume
};