import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider } from "@/components/ui/sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { createClient } from '@/lib/supabase/server'
import "@/app/globals.css"
import { Toaster } from "@/components/ui/toaster"

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <div className="flex w-full max-h-[100vh] h-[100vh] overflow-hidden">
              {user && !error && (
                <AppSidebar 
                  user={{
                    name: user.email?.split('@')[0] || 'User', // Fallback if no name
                    email: user.email || '',
                    image: user.user_metadata?.avatar_url, // If you have avatar in metadata
                  }} 
                />
              )}
              <main className="p-8 flex-1">
                {children}
                <Toaster />

              </main>
            </div>
          </SidebarProvider>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  )
}