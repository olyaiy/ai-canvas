import Flow from "../page";
import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'

interface PageProps {
  params: {
    id: string
  }
}

async function getProject(projectId: string) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get project
  const { data: project, error } = await supabase
    .from('flow_projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (error || !project) return null

  // Check authorization
  if (project.user_id !== user.id && !project.is_public) {
    redirect('/unauthorized')
  }

  return project
}

export default async function Page({ params }: PageProps) {
  const project = await getProject(params.id)
  
  if (!project) {
    notFound()
  }

  return (
    <div className="w-[100vw] h-[100vh] flex flex-col overflow-hidden">
      {/* Project Header */}
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold">{project.name}</h1>
        <p className="text-sm text-muted-foreground">
          Last updated: {new Date(project.updated_at).toLocaleDateString()}
        </p>
      </div>

      {/* Canvas */}
      <div className="flex-1 p-4">
        <div className="h-full w-full bg-red-500/10 border border-red-500">

        </div>  
      </div>
    </div>
  );
}