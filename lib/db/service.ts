/**
 * Wavelength Database Service
 * CRUD operations for the multi-tenant schema.
 * Uses service role client (bypasses RLS) for agent operations.
 */

import { getSupabaseServerClient } from '@/lib/supabase/client';
import type {
  Institution, InstitutionInsert,
  Program, ProgramInsert, ProgramStatus,
  ProgramStage, ProgramStageInsert, StageType, StageStatus,
  StageOutput, StageOutputInsert,
  StageCitation, StageCitationInsert,
} from './types';

function db() {
  return getSupabaseServerClient();
}

// ── Institutions ──

export async function createInstitution(data: InstitutionInsert): Promise<Institution> {
  const { data: row, error } = await db()
    .from('institutions')
    .insert(data)
    .select()
    .single();
  if (error) throw new Error(`Failed to create institution: ${error.message}`);
  return row;
}

export async function getInstitution(id: string): Promise<Institution | null> {
  const { data, error } = await db()
    .from('institutions')
    .select()
    .eq('id', id)
    .single();
  if (error) return null;
  return data;
}

export async function getInstitutionByName(name: string): Promise<Institution | null> {
  const { data, error } = await db()
    .from('institutions')
    .select()
    .ilike('name', name)
    .limit(1)
    .single();
  if (error) return null;
  return data;
}

export async function listInstitutions(): Promise<Institution[]> {
  const { data, error } = await db()
    .from('institutions')
    .select()
    .order('name');
  if (error) throw new Error(`Failed to list institutions: ${error.message}`);
  return data || [];
}

// ── Programs ──

export async function createProgram(data: ProgramInsert): Promise<Program> {
  const { data: row, error } = await db()
    .from('programs')
    .insert(data)
    .select()
    .single();
  if (error) throw new Error(`Failed to create program: ${error.message}`);
  return row;
}

export async function getProgram(id: string): Promise<Program | null> {
  const { data, error } = await db()
    .from('programs')
    .select()
    .eq('id', id)
    .single();
  if (error) return null;
  return data;
}

export async function listProgramsByInstitution(institutionId: string): Promise<Program[]> {
  const { data, error } = await db()
    .from('programs')
    .select()
    .eq('institution_id', institutionId)
    .order('discovery_score', { ascending: false, nullsFirst: false });
  if (error) throw new Error(`Failed to list programs: ${error.message}`);
  return data || [];
}

export async function updateProgramStatus(id: string, status: ProgramStatus): Promise<void> {
  const { error } = await db()
    .from('programs')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(`Failed to update program status: ${error.message}`);
}

export async function updateProgramDiscoveryScores(
  id: string,
  scores: { discovery_score: number; discovery_tier: string; discovery_method?: string }
): Promise<void> {
  const { error } = await db()
    .from('programs')
    .update({ ...scores, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(`Failed to update discovery scores: ${error.message}`);
}

export async function updateProgramValidationScores(
  id: string,
  scores: { validation_score: number; validation_recommendation: string }
): Promise<void> {
  const { error } = await db()
    .from('programs')
    .update({ ...scores, status: 'validated', updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(`Failed to update validation scores: ${error.message}`);
}

// ── Program Stages ──

export async function createProgramStage(data: ProgramStageInsert): Promise<ProgramStage> {
  const { data: row, error } = await db()
    .from('program_stages')
    .insert(data)
    .select()
    .single();
  if (error) throw new Error(`Failed to create program stage: ${error.message}`);
  return row;
}

export async function getProgramStage(programId: string, stageType: StageType): Promise<ProgramStage | null> {
  const { data, error } = await db()
    .from('program_stages')
    .select()
    .eq('program_id', programId)
    .eq('stage_type', stageType)
    .single();
  if (error) return null;
  return data;
}

export async function listStagesByProgram(programId: string): Promise<ProgramStage[]> {
  const { data, error } = await db()
    .from('program_stages')
    .select()
    .eq('program_id', programId)
    .order('stage_number');
  if (error) throw new Error(`Failed to list stages: ${error.message}`);
  return data || [];
}

export async function updateStageStatus(
  id: string,
  status: StageStatus,
  extras?: Partial<ProgramStage>
): Promise<void> {
  const update: Record<string, any> = { status, ...extras };
  if (status === 'running') update.started_at = new Date().toISOString();
  if (status === 'complete' || status === 'error' || status === 'partial') {
    update.completed_at = new Date().toISOString();
  }
  const { error } = await db()
    .from('program_stages')
    .update(update)
    .eq('id', id);
  if (error) throw new Error(`Failed to update stage status: ${error.message}`);
}

// ── Stage Outputs ──

export async function saveStageOutput(data: StageOutputInsert): Promise<StageOutput> {
  const { data: row, error } = await db()
    .from('stage_outputs')
    .insert(data)
    .select()
    .single();
  if (error) throw new Error(`Failed to save stage output: ${error.message}`);
  return row;
}

export async function getStageOutputs(stageId: string): Promise<StageOutput[]> {
  const { data, error } = await db()
    .from('stage_outputs')
    .select()
    .eq('stage_id', stageId)
    .order('created_at');
  if (error) throw new Error(`Failed to get stage outputs: ${error.message}`);
  return data || [];
}

export async function getLatestOutput(stageId: string, outputType: string): Promise<StageOutput | null> {
  const { data, error } = await db()
    .from('stage_outputs')
    .select()
    .eq('stage_id', stageId)
    .eq('output_type', outputType)
    .order('version', { ascending: false })
    .limit(1)
    .single();
  if (error) return null;
  return data;
}

// ── Stage Citations ──

export async function saveCitations(citations: StageCitationInsert[]): Promise<number> {
  if (citations.length === 0) return 0;
  const { data, error } = await db()
    .from('stage_citations')
    .insert(citations)
    .select('id');
  if (error) throw new Error(`Failed to save citations: ${error.message}`);
  return data?.length || 0;
}

export async function getCitationsByStage(stageId: string): Promise<StageCitation[]> {
  const { data, error } = await db()
    .from('stage_citations')
    .select()
    .eq('stage_id', stageId)
    .order('created_at');
  if (error) throw new Error(`Failed to get citations: ${error.message}`);
  return data || [];
}

export async function getCitationsByProgram(programId: string): Promise<StageCitation[]> {
  // Get all citations across all stages for a program
  const stages = await listStagesByProgram(programId);
  const stageIds = stages.map(s => s.id);
  if (stageIds.length === 0) return [];

  const { data, error } = await db()
    .from('stage_citations')
    .select()
    .in('stage_id', stageIds)
    .order('created_at');
  if (error) throw new Error(`Failed to get program citations: ${error.message}`);
  return data || [];
}

// ── Convenience: Save full Discovery results ──

export async function saveDiscoveryResults(
  institutionId: string,
  programId: string,
  briefMarkdown: string,
  structuredData: Record<string, any>,
  metadata: Record<string, any>
): Promise<{ stageId: string }> {
  // Create or update the Discovery stage
  const stage = await createProgramStage({
    program_id: programId,
    institution_id: institutionId,
    stage_type: 'discovery',
    stage_number: 1,
    status: 'complete',
    started_at: metadata.startTime,
    completed_at: metadata.endTime,
    duration_seconds: metadata.durationSeconds,
    total_searches: metadata.totalSearches,
    model_used: 'claude-sonnet-4-6',
    metadata: metadata.phaseTiming || {},
  });

  // Save the brief
  await saveStageOutput({
    stage_id: stage.id,
    institution_id: institutionId,
    output_type: 'brief_markdown',
    content: briefMarkdown,
    content_format: 'markdown',
    word_count: briefMarkdown.split(/\s+/).length,
  });

  // Save structured data
  await saveStageOutput({
    stage_id: stage.id,
    institution_id: institutionId,
    output_type: 'structured_data',
    content: JSON.stringify(structuredData),
    content_format: 'json',
  });

  return { stageId: stage.id };
}
