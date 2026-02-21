'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InstitutionTypeahead } from '@/components/ui/InstitutionTypeahead';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const FUNDING_OPTIONS = [
  { value: 'perkins_v', label: 'Perkins V' },
  { value: 'wioa', label: 'WIOA' },
  { value: 'employer_sponsored', label: 'Employer-Sponsored' },
  { value: 'self_pay', label: 'Self-Pay' },
  { value: 'grant', label: 'Grant Funded' },
];

export default function SubmitPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOptional, setShowOptional] = useState(false);
  const [formData, setFormData] = useState({
    // Required
    client_name: '',
    client_email: '',
    program_name: '',
    program_description: '',
    target_occupation: '',
    geographic_area: '',
    // Strongly recommended
    program_type: '',
    target_audience: '',
    target_learner_profile: '',
    delivery_format: '',
    estimated_program_length: '',
    estimated_tuition: '',
    institutional_capacity: '',
    employer_interest: '',
    strategic_context: '',
    constraints: '',
    // Optional
    competing_programs: '',
    soc_codes: '',
    onet_codes: '',
    target_enrollment_per_cohort: '',
    desired_start_date: '',
    stackable_credential: false,
    funding_sources: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        target_enrollment_per_cohort: formData.target_enrollment_per_cohort
          ? parseInt(formData.target_enrollment_per_cohort)
          : null,
      };

      const response = await fetch('/api/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      const { projectId } = await response.json();
      router.push(`/projects/${projectId}`);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to submit validation request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFunding = (value: string) => {
    setFormData(prev => ({
      ...prev,
      funding_sources: prev.funding_sources.includes(value)
        ? prev.funding_sources.filter(f => f !== value)
        : [...prev.funding_sources, value],
    }));
  };

  const loadSampleData = () => {
    setFormData({
      client_name: '',
      client_email: 'testing@eicc.edu',
      program_name: 'Cybersecurity Certificate',
      program_description: 'A non-credit certificate program preparing learners for entry-level cybersecurity analyst positions, aligned with CompTIA Security+ certification.',
      target_occupation: 'Information Security Analysts (SOC 15-1212)',
      geographic_area: '',
      program_type: 'certificate',
      target_audience: 'Credit students and incumbent workers seeking career advancement',
      target_learner_profile: 'career_changers',
      delivery_format: 'hybrid',
      estimated_program_length: '16 weeks',
      estimated_tuition: '$3,500',
      institutional_capacity: 'Existing computer labs available. IT department has adjunct instructors with cybersecurity experience.',
      employer_interest: 'Collins Aerospace and UnityPoint Health have expressed general interest in cybersecurity training for employees.',
      strategic_context: 'Aligns with college strategic plan to expand IT and healthcare IT programs. No existing cybersecurity offering.',
      constraints: 'Budget: $50k startup, must be profitable by year 2. Timeline: Launch Fall 2026.',
      competing_programs: 'Regional competitor offers a credit-side program. No local noncredit options.',
      soc_codes: '15-1212',
      onet_codes: '15-1212.00',
      target_enrollment_per_cohort: '20',
      desired_start_date: 'Fall 2026',
      stackable_credential: true,
      funding_sources: ['wioa', 'employer_sponsored', 'self_pay'],
    });
    setShowOptional(true);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Feasibility Report Request</h1>
        <p className="text-muted-foreground mb-4">
          Submit your program idea for a comprehensive 7-stage validation analysis.
          Our framework evaluates labor market demand, competitive landscape, learner demand,
          financial viability, institutional fit, regulatory compliance, and employer partnerships.
        </p>
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg text-sm">
          <strong>What you&apos;ll receive:</strong> A professional validation report with weighted scoring
          across 7 dimensions, a composite score, and a clear Go/No-Go recommendation backed by evidence.
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Required Information</CardTitle>
          <CardDescription>
            These fields are required to begin the validation analysis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Required Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client_name">Institution Name *</Label>
                <InstitutionTypeahead
                  value={formData.client_name}
                  onChange={(value) => setFormData({ ...formData, client_name: value })}
                  placeholder="Your community college"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="client_email">Contact Email *</Label>
                <Input
                  id="client_email"
                  type="email"
                  required
                  value={formData.client_email}
                  onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                  placeholder="director@college.edu"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="program_name">Program Name *</Label>
                <Input
                  id="program_name"
                  required
                  value={formData.program_name}
                  onChange={(e) => setFormData({ ...formData, program_name: e.target.value })}
                  placeholder="e.g., Advanced Manufacturing Technician Certificate"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="program_description">Program Description * (1-3 sentences minimum)</Label>
                <Textarea
                  id="program_description"
                  required
                  minLength={50}
                  value={formData.program_description}
                  onChange={(e) => setFormData({ ...formData, program_description: e.target.value })}
                  placeholder="Describe what this program will teach, who it's for, and what credential learners will earn..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target_occupation">Target Occupation(s) or Industry Sector *</Label>
                <Input
                  id="target_occupation"
                  required
                  value={formData.target_occupation}
                  onChange={(e) => setFormData({ ...formData, target_occupation: e.target.value })}
                  placeholder="e.g., Information Security Analysts, Cybersecurity"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="geographic_area">Geographic Service Area *</Label>
                <Input
                  id="geographic_area"
                  required
                  value={formData.geographic_area}
                  onChange={(e) => setFormData({ ...formData, geographic_area: e.target.value })}
                  placeholder="e.g., Greater Phoenix metro area, Southeast Michigan"
                />
              </div>
            </div>

            {/* Strongly Recommended Fields */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-1">Strongly Recommended</h3>
              <p className="text-sm text-muted-foreground mb-4">
                These fields significantly improve the quality of your validation report.
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="program_type">Program Type</Label>
                    <Select
                      value={formData.program_type}
                      onValueChange={(value) => setFormData({ ...formData, program_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="certificate">Certificate</SelectItem>
                        <SelectItem value="diploma">Diploma</SelectItem>
                        <SelectItem value="degree">Associate Degree</SelectItem>
                        <SelectItem value="apprenticeship">Apprenticeship</SelectItem>
                        <SelectItem value="noncredit">Non-Credit Training</SelectItem>
                        <SelectItem value="micro_credential">Micro-Credential</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="target_learner_profile">Target Learner Profile</Label>
                    <Select
                      value={formData.target_learner_profile}
                      onValueChange={(value) => setFormData({ ...formData, target_learner_profile: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select profile" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="career_changers">Career Changers</SelectItem>
                        <SelectItem value="upskilling">Upskilling / Advancement</SelectItem>
                        <SelectItem value="unemployed">Unemployed / Dislocated Workers</SelectItem>
                        <SelectItem value="incumbent_workers">Incumbent Workers</SelectItem>
                        <SelectItem value="other">Other / Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="delivery_format">Delivery Format</Label>
                    <Select
                      value={formData.delivery_format}
                      onValueChange={(value) => setFormData({ ...formData, delivery_format: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in_person">In-Person</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                        <SelectItem value="self_paced">Self-Paced Online</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estimated_program_length">Estimated Program Length</Label>
                    <Input
                      id="estimated_program_length"
                      value={formData.estimated_program_length}
                      onChange={(e) => setFormData({ ...formData, estimated_program_length: e.target.value })}
                      placeholder="e.g., 16 weeks, 2 semesters"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estimated_tuition">Estimated Tuition/Price</Label>
                    <Input
                      id="estimated_tuition"
                      value={formData.estimated_tuition}
                      onChange={(e) => setFormData({ ...formData, estimated_tuition: e.target.value })}
                      placeholder="e.g., $3,500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="target_audience">Target Audience</Label>
                    <Input
                      id="target_audience"
                      value={formData.target_audience}
                      onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                      placeholder="e.g., Working adults, recent graduates"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="institutional_capacity">Existing Institutional Capacity</Label>
                  <Textarea
                    id="institutional_capacity"
                    value={formData.institutional_capacity}
                    onChange={(e) => setFormData({ ...formData, institutional_capacity: e.target.value })}
                    placeholder="What faculty, facilities, equipment, and technology do you already have that could support this program?"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employer_interest">Known Employer Interest</Label>
                  <Textarea
                    id="employer_interest"
                    value={formData.employer_interest}
                    onChange={(e) => setFormData({ ...formData, employer_interest: e.target.value })}
                    placeholder="Have any employers expressed interest in this program or hiring completers? List them here."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="strategic_context">Strategic Context</Label>
                  <Textarea
                    id="strategic_context"
                    value={formData.strategic_context}
                    onChange={(e) => setFormData({ ...formData, strategic_context: e.target.value })}
                    placeholder="How does this program fit your institution's strategic plan, mission, or existing program portfolio?"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="constraints">Constraints & Requirements</Label>
                  <Textarea
                    id="constraints"
                    value={formData.constraints}
                    onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                    placeholder="Budget limits, timeline requirements, facility constraints, accreditation needs, etc."
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Optional Fields (collapsible) */}
            <div className="border-t pt-6">
              <button
                type="button"
                onClick={() => setShowOptional(!showOptional)}
                className="flex items-center gap-2 text-lg font-semibold mb-1 hover:text-primary"
              >
                <span>{showOptional ? '▼' : '▶'}</span>
                Optional Details
              </button>
              <p className="text-sm text-muted-foreground mb-4">
                Additional information that can further improve analysis accuracy.
              </p>

              {showOptional && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="competing_programs">Known Competing Programs</Label>
                    <Textarea
                      id="competing_programs"
                      value={formData.competing_programs}
                      onChange={(e) => setFormData({ ...formData, competing_programs: e.target.value })}
                      placeholder="List any competing programs you're already aware of..."
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="soc_codes">SOC Code(s)</Label>
                      <Input
                        id="soc_codes"
                        value={formData.soc_codes}
                        onChange={(e) => setFormData({ ...formData, soc_codes: e.target.value })}
                        placeholder="e.g., 15-1212"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="onet_codes">O*NET Code(s)</Label>
                      <Input
                        id="onet_codes"
                        value={formData.onet_codes}
                        onChange={(e) => setFormData({ ...formData, onet_codes: e.target.value })}
                        placeholder="e.g., 15-1212.00"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="target_enrollment_per_cohort">Target Enrollment per Cohort</Label>
                      <Input
                        id="target_enrollment_per_cohort"
                        type="number"
                        value={formData.target_enrollment_per_cohort}
                        onChange={(e) => setFormData({ ...formData, target_enrollment_per_cohort: e.target.value })}
                        placeholder="e.g., 20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="desired_start_date">Desired Start Date</Label>
                      <Input
                        id="desired_start_date"
                        value={formData.desired_start_date}
                        onChange={(e) => setFormData({ ...formData, desired_start_date: e.target.value })}
                        placeholder="e.g., Fall 2026"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="stackable_credential"
                      checked={formData.stackable_credential}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, stackable_credential: checked === true })
                      }
                    />
                    <Label htmlFor="stackable_credential">
                      This program is intended to be a stackable credential (leads to further education)
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label>Anticipated Funding Sources</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {FUNDING_OPTIONS.map(option => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`funding-${option.value}`}
                            checked={formData.funding_sources.includes(option.value)}
                            onCheckedChange={() => toggleFunding(option.value)}
                          />
                          <Label htmlFor={`funding-${option.value}`}>{option.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4 border-t">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Submitting...' : 'Submit for 7-Stage Validation'}
              </Button>
              <Button type="button" variant="outline" onClick={loadSampleData}>
                Load Sample
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8 p-6 bg-muted rounded-lg">
        <h2 className="font-semibold mb-2">What happens next?</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
          <li><strong>Stage 1:</strong> Occupation & Labor Market Analysis (SOC codes, BLS projections, wage data)</li>
          <li><strong>Stage 2:</strong> Competitive Landscape Analysis (competitors, gaps, differentiation)</li>
          <li><strong>Stage 3:</strong> Target Learner Demand Assessment (population, barriers, enrollment projection)</li>
          <li><strong>Stage 4:</strong> Financial Viability Analysis (3 scenarios, break-even, margins)</li>
          <li><strong>Stage 5:</strong> Institutional Fit & Capacity (faculty, facilities, strategic alignment)</li>
          <li><strong>Stage 6:</strong> Regulatory & Compliance (Perkins V, WIOA, accreditation)</li>
          <li><strong>Stage 7:</strong> Employer Demand & Partnerships (demand signals, contract training)</li>
          <li><strong>Scoring:</strong> Weighted composite score with Go/No-Go recommendation</li>
        </ol>
        <p className="mt-4 text-sm font-medium">
          Estimated completion time: 10-15 minutes
        </p>
      </div>
    </div>
  );
}
