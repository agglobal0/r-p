import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Edit, ArrowLeft } from 'lucide-react';
import Page from '../components/Page';

const ResumePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resume, setResume] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading resume data
    const loadResume = async () => {
      try {
        // In a real app, fetch from API
        const mockResume = {
          id,
          personalInfo: {
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '(555) 123-4567',
            location: 'San Francisco, CA'
          },
          summary: 'Experienced software engineer with 5+ years of expertise in full-stack development...',
          experience: [
            {
              title: 'Senior Software Engineer',
              company: 'Tech Corp',
              duration: '2020 - Present',
              description: 'Led development of scalable web applications...'
            }
          ],
          education: [
            {
              degree: 'Bachelor of Science in Computer Science',
              school: 'University of Technology',
              year: '2019'
            }
          ],
          skills: ['JavaScript', 'React', 'Node.js', 'Python']
        };
        setResume(mockResume);
      } catch (error) {
        console.error('Error loading resume:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadResume();
  }, [id]);

  const handleDownload = () => {
    // Implement PDF download
    console.log('Downloading resume...');
  };

  const handleEdit = () => {
    navigate(`/resume-builder/${id}`);
  };

  if (isLoading) {
    return (
      <Page title="Loading Resume">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-slate-300">Loading resume...</p>
          </div>
        </div>
      </Page>
    );
  }

  if (!resume) {
    return (
      <Page title="Resume Not Found">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center">
            <p className="text-slate-300 mb-4">Resume not found.</p>
            <button
              onClick={() => navigate('/history')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Back to History
            </button>
          </div>
        </div>
      </Page>
    );
  }

  return (
    <Page title={`Resume - ${resume.personalInfo.name}`}>
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header Actions */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate('/history')}
            className="flex items-center text-slate-400 hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to History
          </button>
          <div className="flex space-x-4">
            <button
              onClick={handleEdit}
              className="flex items-center px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </button>
          </div>
        </div>

        {/* Resume Content */}
        <div className="bg-slate-800 rounded-lg p-8">
          {/* Personal Info */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-100 mb-2">
              {resume.personalInfo.name}
            </h1>
            <div className="text-slate-300 space-y-1">
              <p>{resume.personalInfo.email}</p>
              <p>{resume.personalInfo.phone}</p>
              <p>{resume.personalInfo.location}</p>
            </div>
          </div>

          {/* Summary */}
          {resume.summary && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-slate-100 mb-3">Professional Summary</h2>
              <p className="text-slate-300 leading-relaxed">{resume.summary}</p>
            </div>
          )}

          {/* Experience */}
          {resume.experience && resume.experience.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-slate-100 mb-3">Experience</h2>
              <div className="space-y-6">
                {resume.experience.map((exp, index) => (
                  <div key={index}>
                    <h3 className="text-lg font-medium text-slate-100">{exp.title}</h3>
                    <p className="text-blue-400 mb-2">{exp.company} • {exp.duration}</p>
                    <p className="text-slate-300">{exp.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {resume.education && resume.education.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-slate-100 mb-3">Education</h2>
              <div className="space-y-4">
                {resume.education.map((edu, index) => (
                  <div key={index}>
                    <h3 className="text-lg font-medium text-slate-100">{edu.degree}</h3>
                    <p className="text-slate-300">{edu.school} • {edu.year}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {resume.skills && resume.skills.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-slate-100 mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {resume.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Page>
  );
};

export default ResumePage;