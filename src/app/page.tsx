import Flow from "./(routes)/canvas/canvas";
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/logout-button'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { formatDistanceToNow } from 'date-fns'
import { Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createNewProject } from './(routes)/canvas/actions'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

async function getRecentProjects(userId: string, page = 1, pageSize = 4) {
  const supabase = await createClient()
  
  // Get total count
  const { count } = await supabase
    .from('flow_projects')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // Get paginated results
  const { data: projects, error } = await supabase
    .from('flow_projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  if (error) throw error
  return { projects, totalPages: Math.ceil((count || 0) / pageSize) }
}

async function getLatestProject(userId: string) {
  const supabase = await createClient()
  const { data: project, error } = await supabase
    .from('flow_projects')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  if (error) return null
  return project
}

export default async function Page({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const currentPage = Number(searchParams.page) || 1
  const pageSize = 4

  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  
  if (error || !data?.user) {
    redirect('/login')
  }

  const { projects: recentProjects, totalPages } = await getRecentProjects(
    data.user.id,
    currentPage,
    pageSize
  )

  const latestProject = await getLatestProject(data.user.id)
  const initialFlowData = latestProject?.flow_data || null

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
            <Flow 
              initialFlowData={initialFlowData}
              projectName={latestProject?.name || 'Preview'}
              isPreview={true}
            />
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
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentProjects.map((project) => (
                <Link 
                  href={`/canvas/${project.id}`} 
                  key={project.id}
                  className={`${latestProject?.id === project.id ? 'order-first' : ''}`}
                >
                  <Card className={`
                    hover:bg-accent transition-all duration-200 hover:shadow-lg
                    ${latestProject?.id === project.id ? 
                      'ring-2 ring-purple-500 dark:ring-purple-400 relative transform -translate-y-1 shadow-lg' : 
                      ''
                    }
                  `}>
                    {latestProject?.id === project.id && (
                      <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                        Previewing
                      </div>
                    )}
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
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <Link
                  href={`/?page=${currentPage - 1}`}
                  className={`${
                    currentPage <= 1
                      ? 'pointer-events-none opacity-50'
                      : ''
                  }`}
                >
                  <Button variant="outline" size="sm">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </Link>
                
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                
                <Link
                  href={`/?page=${currentPage + 1}`}
                  className={`${
                    currentPage >= totalPages
                      ? 'pointer-events-none opacity-50'
                      : ''
                  }`}
                >
                  <Button variant="outline" size="sm">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}