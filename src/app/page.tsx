import Flow from "./(routes)/canvas/page";
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/logout-button'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { formatDistanceToNow } from 'date-fns'
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createNewProject } from './(routes)/canvas/actions'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

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
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Flow Canvas</h1>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">{data.user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Canvas Preview */}
        <div className="mb-8">
          <div className="relative h-[60vh] rounded-lg overflow-hidden border bg-card">
            <Flow />
          </div>
        </div>

        {/* Recent Projects Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Recent Projects</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Project
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <form action={createNewProject} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="My Amazing Flow"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Create Project
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recentProjects.map((project) => (
              <Link href={`/canvas/${project.id}`} key={project.id}>
                <Card className="hover:bg-accent transition-all duration-200 hover:shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-lg line-clamp-1">{project.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Updated {formatDistanceToNow(new Date(project.updated_at))} ago
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      {project.node_count || 0} nodes • {project.edge_count || 0} connections
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}