import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Brain, FileText, Users, TrendingUp, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-5xl font-bold mb-4">Workforce Intelligence</h1>
        <p className="text-xl text-muted-foreground mb-8">
          AI-Powered Program Validation for Community Colleges
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/submit">
            <Button size="lg">Submit Validation Request</Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline">
              View Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <Card>
          <CardHeader>
            <Brain className="h-10 w-10 mb-2 text-blue-500" />
            <CardTitle>AI-Powered Research</CardTitle>
            <CardDescription>
              Specialized AI agents conduct comprehensive market research, competitive analysis, and
              strategic planning
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Users className="h-10 w-10 mb-2 text-green-500" />
            <CardTitle>Multi-Perspective Analysis</CardTitle>
            <CardDescription>
              6+ Confluence Labs personas debate program viability from product, financial,
              marketing, and operations perspectives
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <FileText className="h-10 w-10 mb-2 text-purple-500" />
            <CardTitle>Professional Deliverable</CardTitle>
            <CardDescription>
              Receive a comprehensive 30-40 page validation report with actionable insights and
              clear recommendations
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Our Process</h2>

        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                1
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Submit Program Idea</h3>
              <p className="text-muted-foreground">
                Provide basic information about your program concept, target audience, and
                constraints
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                2
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">AI Research & Analysis</h3>
              <p className="text-muted-foreground">
                Our system deploys 5 specialized research agents to analyze market demand,
                competition, curriculum design, financials, and marketing strategy
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                3
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Tiger Team Synthesis</h3>
              <p className="text-muted-foreground">
                Multi-persona executive debate evaluates viability and provides GO/NO-GO
                recommendation
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                4
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-1">Professional Report</h3>
              <p className="text-muted-foreground">
                Receive comprehensive validation report with executive summary, detailed analysis,
                and implementation roadmap
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 max-w-2xl mx-auto text-center">
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle>Ready to validate your program idea?</CardTitle>
            <CardDescription>
              Get professional validation in 48 hours
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/submit">
              <Button size="lg">Get Started</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
