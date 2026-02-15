'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ValidationProject, ResearchComponent } from '@/lib/types/database';
import { CheckCircle2, Circle, AlertCircle, Loader2 } from 'lucide-react';

const componentLabels: Record<string, string> = {
  market_analysis: 'Market Analysis',
  competitive_landscape: 'Competitive Landscape',
  curriculum_design: 'Curriculum Design',
  financial_projections: 'Financial Projections',
  marketing_strategy: 'Marketing Strategy',
  tiger_team_synthesis: 'Tiger Team Synthesis',
};

const statusIcons = {
  pending: <Circle className="h-5 w-5 text-gray-400" />,
  in_progress: <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />,
  completed: <CheckCircle2 className="h-5 w-5 text-green-500" />,
  error: <AlertCircle className="h-5 w-5 text-red-500" />,
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<ValidationProject | null>(null);
  const [components, setComponents] = useState<ResearchComponent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjectData();
    const interval = setInterval(fetchProjectData, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      const [projectRes, componentsRes] = await Promise.all([
        fetch(`/api/projects/${projectId}`),
        fetch(`/api/projects/${projectId}/components`),
      ]);

      if (!projectRes.ok || !componentsRes.ok) {
        throw new Error('Failed to fetch project data');
      }

      const projectData = await projectRes.json();
      const componentsData = await componentsRes.json();

      setProject(projectData);
      setComponents(componentsData);
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProgress = () => {
    if (components.length === 0) return 0;
    const completed = components.filter((c) => c.status === 'completed').length;
    return (completed / components.length) * 100;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p>Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p>Project not found</p>
        <Link href="/dashboard">
          <Button className="mt-4">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-4">
            ← Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-4xl font-bold mb-2">{project.program_name}</h1>
        <p className="text-muted-foreground">{project.client_name}</p>
      </div>

      <div className="grid gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Project Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Program Type</p>
                <p className="font-medium capitalize">{project.program_type || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Target Audience</p>
                <p className="font-medium">{project.target_audience || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className="capitalize">{project.status}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">
                  {new Date(project.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {project.constraints && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Constraints</p>
                <p className="text-sm">{project.constraints}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Research Progress</CardTitle>
            <CardDescription>
              {components.filter((c) => c.status === 'completed').length} of {components.length}{' '}
              components completed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={calculateProgress()} className="mb-6" />

            <div className="space-y-3">
              {components.map((component) => (
                <div
                  key={component.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {statusIcons[component.status]}
                    <div>
                      <p className="font-medium">
                        {componentLabels[component.component_type] || component.component_type}
                      </p>
                      {component.error_message && (
                        <p className="text-sm text-red-500">{component.error_message}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {component.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {project.status === 'review' || project.status === 'completed' ? (
          <Card>
            <CardHeader>
              <CardTitle>Report Ready</CardTitle>
              <CardDescription>
                Your validation report is ready for review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/projects/${projectId}/report`}>
                <Button size="lg">View Full Report</Button>
              </Link>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
