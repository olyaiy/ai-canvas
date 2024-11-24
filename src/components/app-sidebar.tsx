'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Settings, HelpCircle, GitBranch, Home, Menu, ChevronRight } from 'lucide-react'
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

const user = {
  name: 'John Doe',
  email: 'john@example.com',
  image: '/placeholder.svg?height=32&width=32'
}

const menuItems = [
  { icon: Home, label: 'Dashboard' },
  { icon: GitBranch, label: 'Flows' },
  { icon: Settings, label: 'Settings' },
  { icon: HelpCircle, label: 'Help' },
]

export function AppSidebar() {
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  const handleLogout = () => {
    console.log('Logging out...')
    router.push('/login')
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <Sidebar className={cn(
      "flex flex-col justify-between transition-all duration-300 ease-in-out bg-white dark:bg-gray-900",
      isCollapsed ? "w-20" : "w-64"
    )}>
      <div>
        <SidebarHeader className="p-4">
          <motion.div
            initial={false}
            animate={{ width: isCollapsed ? 48 : 224 }}
            className="flex items-center gap-4 overflow-hidden"
          >
            <Avatar className="h-12 w-12 border-2 border-primary">
              <AvatarImage src={user.image} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-semibold text-lg">{user.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{user.email}</span>
              </div>
            )}
          </motion.div>
        </SidebarHeader>
        <Separator className="my-4" />
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item, index) => (
              <TooltipProvider key={item.label}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Button variant="ghost" className={cn(
                          "w-full justify-start gap-4 p-4 transition-all duration-200 ease-in-out",
                          isCollapsed && "justify-center"
                        )}>
                          <item.icon className={cn("h-5 w-5", isCollapsed ? "mx-auto" : "mr-2")} />
                          <motion.span
                            initial={false}
                            animate={{ opacity: isCollapsed ? 0 : 1 }}
                            className="font-medium"
                          >
                            {item.label}
                          </motion.span>
                        </Button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </TooltipTrigger>
                  {isCollapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
                </Tooltip>
              </TooltipProvider>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </div>
      <SidebarFooter className="p-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" className={cn(
                "w-full justify-start gap-4 p-4 transition-all duration-200 ease-in-out",
                isCollapsed && "justify-center"
              )} onClick={handleLogout}>
                <LogOut className={cn("h-5 w-5", isCollapsed ? "mx-auto" : "mr-2")} />
                <motion.span
                  initial={false}
                  animate={{ opacity: isCollapsed ? 0 : 1 }}
                  className="font-medium"
                >
                  Logout
                </motion.span>
              </Button>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent side="right">Logout</TooltipContent>}
          </Tooltip>
        </TooltipProvider>
        <Separator className="my-4" />
        <Button
          variant="ghost"
          size="icon"
          className="w-full flex justify-end items-center p-2"
          onClick={toggleSidebar}
        >
          <ChevronRight className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}

