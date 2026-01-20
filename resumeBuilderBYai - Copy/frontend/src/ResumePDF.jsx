// ResumePDF.jsx
import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

export default function ResumePDF({ data, theme }) {
  const styles = StyleSheet.create({
    page: {
      backgroundColor: "#fff",
      padding: 40,
      fontSize: 11,
      fontFamily: "Helvetica",
      color: theme.text,
      lineHeight: 1.4,
    },
    header: {
      marginBottom: 16,
      paddingBottom: 8,
      borderBottom: `2pt solid ${theme.primary}`,
    },
    name: {
      fontSize: 22,
      fontWeight: "bold",
      color: theme.primary,
    },
    contact: {
      fontSize: 10,
      marginTop: 4,
      color: theme.muted,
    },
    section: {
      marginTop: 20, // more whitespace between sections
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: "bold",
      color: theme.primary,
      marginBottom: 8,
      textTransform: "uppercase",
    },
    paragraph: {
      fontSize: 11,
      marginBottom: 6,
    },
    listItem: {
      marginBottom: 4,
      fontSize: 11,
    },
    jobRole: {
      fontSize: 12,
      fontWeight: "bold",
      color: theme.text,
    },
    company: {
      fontSize: 11,
      color: theme.muted,
    },
    achievement: {
      marginLeft: 12,
      fontSize: 10,
    },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{data.name}</Text>
          <Text style={styles.contact}>
            {data.contact?.email} · {data.contact?.phone} · {data.contact?.location}
          </Text>
        </View>

        {/* Summary */}
        {data.summaryText && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.paragraph}>{data.summaryText}</Text>
          </View>
        )}

        {/* Skills */}
        {data.skills?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View>
              {data.skills.map((skill, i) => (
                <Text key={i} style={styles.listItem}>• {skill}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Education */}
        {data.education?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {data.education.map((edu, i) => (
              <Text key={i} style={styles.listItem}>
                {edu.degree} - {edu.institution} ({edu.year})
              </Text>
            ))}
          </View>
        )}

        {/* Experience */}
        {data.experience?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {data.experience.map((exp, i) => (
              <View key={i} style={{ marginBottom: 10 }}>
                <Text style={styles.jobRole}>
                  {exp.role}
                </Text>
                <Text style={styles.company}>
                  {exp.company} · {exp.years}
                </Text>
                {exp.achievements?.map((a, j) => (
                  <Text key={j} style={styles.achievement}>- {a}</Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {data.projects?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {data.projects.map((p, i) => (
              <View key={i} style={{ marginBottom: 6 }}>
                <Text style={styles.jobRole}>{p.title}</Text>
                <Text style={styles.paragraph}>{p.desc}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Certifications */}
        {data.certifications?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {data.certifications.map((c, i) => (
              <Text key={i} style={styles.listItem}>• {c}</Text>
            ))}
          </View>
        )}

        {/* Achievements */}
        {data.achievements?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            {data.achievements.map((a, i) => (
              <Text key={i} style={styles.listItem}>• {a}</Text>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
