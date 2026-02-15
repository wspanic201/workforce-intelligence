import { loadPersona } from '@/lib/confluence-labs/loader';
import { callClaude, extractJSON } from '@/lib/ai/anthropic';
import { ValidationProject } from '@/lib/types/database';
import { getSupabaseServerClient } from '@/lib/supabase/client';

export interface Course {
  course_code: string;
  course_name: string;
  credit_hours: number;
  description: string;
  competencies: string[];
}

export interface CurriculumDesignData {
  program_overview: {
    total_credits: number;
    duration: string;
    delivery_format: string;
    schedule_type: string;
  };
  learning_outcomes: string[];
  courses: Course[];
  certifications_embedded: string[];
  equipment_requirements: string[];
  faculty_requirements: string[];
  accreditation_considerations: string[];
  recommendations: string[];
}

export async function runCurriculumDesign(
  projectId: string,
  project: ValidationProject
): Promise<{ data: CurriculumDesignData; markdown: string }> {
  const startTime = Date.now();
  const supabase = getSupabaseServerClient();

  try {
    const persona = await loadPersona('curriculum-director');

    const prompt = `${persona.fullContext}

TASK: Design a comprehensive curriculum framework for a workforce program.

PROGRAM DETAILS:
- Program Name: ${project.program_name}
- Program Type: ${project.program_type || 'Not specified'}
- Target Audience: ${project.target_audience || 'Not specified'}
- Client: ${project.client_name}
${project.constraints ? `- Constraints: ${project.constraints}` : ''}

DESIGN REQUIREMENTS:
1. Define program-level learning outcomes (career-focused)
2. Create course sequence (4-8 courses typical for certificate)
3. For each course:
   - Course code and name
   - Credit hours
   - Description
   - Key competencies covered
4. Identify industry certifications that can be embedded
5. List equipment/lab requirements
6. Define faculty qualifications needed
7. Note accreditation considerations

OUTPUT FORMAT (JSON):
{
  "program_overview": {
    "total_credits": <number>,
    "duration": "X months/semesters",
    "delivery_format": "online|in-person|hybrid",
    "schedule_type": "full-time|part-time|flexible"
  },
  "learning_outcomes": [
    "Outcome 1",
    "Outcome 2"
  ],
  "courses": [
    {
      "course_code": "ABC 101",
      "course_name": "Course Name",
      "credit_hours": 3,
      "description": "Course description",
      "competencies": ["Competency 1", "Competency 2"]
    }
  ],
  "certifications_embedded": ["Certification 1", "Certification 2"],
  "equipment_requirements": ["Equipment 1", "Equipment 2"],
  "faculty_requirements": ["Requirement 1", "Requirement 2"],
  "accreditation_considerations": ["Consideration 1"],
  "recommendations": ["Recommendation 1"]
}

CRITICAL REQUIREMENTS:
- Base design on industry standards and job requirements
- Align with Higher Learning Commission standards (if applicable)
- Consider typical community college structures
- Courses should build on each other logically
- Include both technical and employability skills
- Be realistic about resource requirements

Respond with valid JSON wrapped in \`\`\`json code blocks.`;

    const { content, tokensUsed } = await callClaude(prompt, {
      maxTokens: 4000,
    });

    const data = extractJSON(content) as CurriculumDesignData;
    const markdown = formatCurriculumDesign(data, project);

    const duration = Date.now() - startTime;
    await supabase.from('agent_sessions').insert({
      project_id: projectId,
      agent_type: 'curriculum-designer',
      persona: 'curriculum-director',
      prompt: prompt.substring(0, 5000),
      response: content.substring(0, 10000),
      tokens_used: tokensUsed,
      duration_ms: duration,
      status: 'success',
    });

    return { data, markdown };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('Curriculum design error:', error);

    await supabase.from('agent_sessions').insert({
      project_id: projectId,
      agent_type: 'curriculum-designer',
      persona: 'curriculum-director',
      duration_ms: duration,
      status: 'error',
      error_message: error instanceof Error ? error.message : String(error),
    });

    throw error;
  }
}

function formatCurriculumDesign(data: CurriculumDesignData, project: ValidationProject): string {
  return `# Program Design: ${project.program_name}

## Program Overview

- **Total Credits:** ${data.program_overview.total_credits}
- **Duration:** ${data.program_overview.duration}
- **Delivery Format:** ${data.program_overview.delivery_format}
- **Schedule Type:** ${data.program_overview.schedule_type}

## Program Learning Outcomes

Upon completion of this program, students will be able to:

${data.learning_outcomes.map((outcome, i) => `${i + 1}. ${outcome}`).join('\n')}

## Course Sequence

${data.courses.map((course, i) => `
### ${course.course_code}: ${course.course_name}
**Credits:** ${course.credit_hours}

${course.description}

**Key Competencies:**
${course.competencies.map(comp => `- ${comp}`).join('\n')}
`).join('\n')}

## Embedded Certifications

This program prepares students for the following industry certifications:

${data.certifications_embedded.map(cert => `- ${cert}`).join('\n')}

## Equipment & Lab Requirements

${data.equipment_requirements.map(req => `- ${req}`).join('\n')}

## Faculty Requirements

${data.faculty_requirements.map(req => `- ${req}`).join('\n')}

## Accreditation Considerations

${data.accreditation_considerations.map(cons => `- ${cons}`).join('\n')}

## Implementation Recommendations

${data.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

---
*This curriculum framework is designed to align with industry standards and workforce needs.*
`;
}
