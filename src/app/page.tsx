import Flow from "./(routes)/canvas/page";
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/logout-button'
import Link from 'next/link'
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from 'date-fns'

async function getRecentProjects(userId: string) {
  const supabase = await createClient()
  const { data: projects, error } = await supabase
    .from('flow_projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(5)

  if (error) throw error
  return projects
}

export default async function Page() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  
  if (error || !data?.user) {
    redirect('/login')
  }

  const recentProjects = await getRecentProjects(data.user.id)

  return (
    <div className="flex flex-col h-full w-full">
      {/* Canvas Area */}
      <div className="relative h-[70vh] w-full">
        <div className="h-full w-full bg-red-500/20 border border-red-500">
          <Flow />
        </div>  
      </div>

      {/* Recent Projects Section */}
      <div className="p-6 bg-background">
        <h2 className="text-2xl font-bold mb-4">Recent Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {recentProjects.map((project) => (
            <Link href={`/canvas/${project.id}`} key={project.id}>
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Updated {formatDistanceToNow(new Date(project.updated_at))} ago
                  </p>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
