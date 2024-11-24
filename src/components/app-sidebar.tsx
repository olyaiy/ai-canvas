'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Settings, HelpCircle, GitBranch, Home, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { logout } from '@/app/login/actions'

const menuItems = [
  { icon: Home, label: 'Dashboard', href: '/' },
  { icon: GitBranch, label: 'Flows', href: '/flows' },
  { icon: Settings, label: 'Settings', href: '/settings' },
  { icon: HelpCircle, label: 'Help', href: '/help' },
]

export function AppSidebar({ user }: { user: { name: string; email: string; image?: string } }) {
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  return (
    <Sidebar className={cn(
      "flex flex-col h-screen border-r bg-background transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <SidebarHeader className="p-4">
        <motion.div
          initial={false}
          animate={{ width: isCollapsed ? 48 : 224 }}
          className="flex items-center gap-3"
        >
          <Avatar className="h-9 w-9 border transition-colors">
            <AvatarImage src={user.image} alt={user.name} />
            <AvatarFallback className="bg-primary/10 text-primary">{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="font-medium truncate">{user.name}</span>
              <span className="text-xs text-muted-foreground truncate">{user.email}</span>
            </div>
          )}
        </motion.div>
      </SidebarHeader>
      
      <Separator />
      
      <SidebarContent className="flex-1 px-2 py-4">
        <SidebarMenu className="space-y-1">
          {menuItems.map((item) => (
            <TooltipProvider key={item.label} delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuItem>
                    <Button 
                      variant="ghost" 
                      className={cn(
                        "w-full justify-start h-10 px-3",
                        isCollapsed && "justify-center px-0"
                      )}
                      onClick={() => router.push(item.href)}
                    >
                      <item.icon className={cn(
                        "h-4 w-4",
                        isCollapsed ? "mx-auto" : "mr-2"
                      )} />
                      {!isCollapsed && (
                        <span className="text-sm font-medium">{item.label}</span>
                      )}
                    </Button>
                  </SidebarMenuItem>
                </TooltipTrigger>
                {isCollapsed && (
                  <TooltipContent side="right" className="text-xs">
                    {item.label}
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="px-2 py-4">
        <Separator className="mb-4" />
        <div className="space-y-1">
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <form action={logout}>
                  <Button 
                    variant="ghost" 
                    className={cn(
                      "w-full justify-start h-10 px-3",
                      isCollapsed && "justify-center px-0"
                    )}
                    type="submit"
                  >
                    <LogOut className={cn(
                      "h-4 w-4",
                      isCollapsed ? "mx-auto" : "mr-2"
                    )} />
                    {!isCollapsed && (
                      <span className="text-sm font-medium">Log out</span>
                    )}
                  </Button>
                </form>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" className="text-xs">
                  Log out
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "w-full justify-between px-3",
              isCollapsed && "justify-center px-0"
            )}
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {!isCollapsed && <span className="text-sm">Collapse</span>}
            <ChevronRight className={cn(
              "h-4 w-4 transition-transform",
              isCollapsed && "rotate-180"
            )} />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}

