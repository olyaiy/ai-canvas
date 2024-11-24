'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function saveProject(formData: FormData) {
  const supabase = await createClient()

  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const projectData = {
    name: formData.get('name') as string,
    flow_data: JSON.parse(formData.get('flow_data') as string),
    user_id: user.id,
  }

  const { error } = await supabase
    .from('flow_projects')
    .insert(projectData)

  if (error) {
    console.error('Error saving project:', error)
    redirect('/error')
  }

  revalidatePath('/canvas')
  redirect('/canvas')
}