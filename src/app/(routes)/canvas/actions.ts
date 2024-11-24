'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function saveProject(formData: FormData) {
  const supabase = await createClient()

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get the project ID from the formData
  const projectId = formData.get('projectId') as string

  const projectData = {
    name: formData.get('name') as string,
    flow_data: JSON.parse(formData.get('flow_data') as string),
    updated_at: new Date().toISOString(),
  }

  // Update existing project instead of creating new one
  const { error } = await supabase
    .from('flow_projects')
    .update(projectData)
    .eq('id', projectId)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error saving project:', error)
    redirect('/error')
  }

  // Revalidate both paths
  revalidatePath('/')
  revalidatePath(`/canvas/${projectId}`)
}

export async function createNewProject(formData: FormData) {
  'use server'
  
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const newProject = {
    name: (formData.get('name') as string) || 'Untitled Flow',
    description: '',
    flow_data: {
      nodes: [],
      edges: []
    },
    user_id: user.id,
    is_public: false,
    version: 1
  }

  const { data, error } = await supabase
    .from('flow_projects')
    .insert(newProject)
    .select()
    .single()

  if (error) {
    throw new Error('Failed to create project')
  }

  revalidatePath('/')
  redirect(`/canvas/${data.id}`)
}

export async function getProjectFlow(projectId: string) {
  'use server'
  
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: project, error } = await supabase
    .from('flow_projects')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error('Error fetching project:', error)
    return null
  }

  return project
}


export async function deleteProject(projectId: string) {
    'use server'

    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { error } = await supabase
        .from('flow_projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error deleting project:', error)
        return { success: false }
    }

    revalidatePath('/')
    return { success: true }
}
