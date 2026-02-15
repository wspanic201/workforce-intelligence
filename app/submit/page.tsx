'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function SubmitPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    program_name: '',
    program_type: '',
    target_audience: '',
    constraints: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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

  const loadSampleData = () => {
    setFormData({
      client_name: 'Eastern Iowa Community Colleges',
      client_email: 'testing@eicc.edu',
      program_name: 'Cybersecurity Certificate',
      program_type: 'certificate',
      target_audience: 'Credit students and incumbent workers seeking career advancement',
      constraints: 'Budget: $50k startup, must be profitable by year 2. Timeline: Launch Fall 2026. Facility: Existing computer labs available.',
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Program Validation Request</h1>
        <p className="text-muted-foreground mb-8">
          Share your program details and we&apos;ll deliver a comprehensive validation
          in 48 hours — market demand, financial projections, competitive analysis,
          and strategic recommendations.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Program Details</CardTitle>
          <CardDescription>
            Provide information about the program you want validated. Our comprehensive validation
            framework covers market research, competitive analysis, curriculum design, financial projections,
            and marketing strategy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="client_name">Institution/Client Name *</Label>
              <Input
                id="client_name"
                required
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                placeholder="e.g., Kirkwood Community College"
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
              <Label htmlFor="program_type">Program Type</Label>
              <Select
                value={formData.program_type}
                onValueChange={(value) => setFormData({ ...formData, program_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select program type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="certificate">Certificate</SelectItem>
                  <SelectItem value="diploma">Diploma</SelectItem>
                  <SelectItem value="degree">Associate Degree</SelectItem>
                  <SelectItem value="apprenticeship">Apprenticeship</SelectItem>
                  <SelectItem value="noncredit">Non-Credit Training</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_audience">Target Audience</Label>
              <Input
                id="target_audience"
                value={formData.target_audience}
                onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                placeholder="e.g., High school graduates, incumbent workers, career changers"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="constraints">Constraints & Requirements</Label>
              <Textarea
                id="constraints"
                value={formData.constraints}
                onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                placeholder="Budget limits, timeline requirements, facility constraints, accreditation needs, etc."
                rows={4}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? 'Submitting...' : 'Submit Validation Request'}
              </Button>
              <Button type="button" variant="outline" onClick={loadSampleData}>
                Load Sample (Cybersecurity Certificate)
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8 p-6 bg-muted rounded-lg">
        <h2 className="font-semibold mb-2">What happens next?</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
          <li>Our analysis engine will research the labor market demand and competitive landscape</li>
          <li>A curriculum framework will be designed based on industry standards</li>
          <li>Financial projections and ROI analysis will be generated</li>
          <li>A comprehensive marketing strategy will be developed</li>
          <li>
            Our 6-lens evaluation will assess the program&apos;s viability from every critical business
            perspective and provide a GO/NO-GO recommendation
          </li>
          <li>A professional 30-40 page report will be compiled for your review</li>
        </ol>
        <p className="mt-4 text-sm font-medium">
          Estimated completion time: 48 hours
        </p>
      </div>
    </div>
  );
}
