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

  const handleNavigation = () => {
    router.push('/')
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <Sidebar className={cn(
      "flex flex-col h-screen transition-all duration-300 ease-in-out bg-white dark:bg-gray-900",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <SidebarHeader className="">
        <motion.div
          initial={false}
          animate={{ width: isCollapsed ? 48 : 224 }}
          className="flex items-center gap-4 overflow-hidden pt-4"
        >
          <Avatar className="h-10 w-10 border-2 border-primary">
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
      <SidebarContent className="flex-1 flex items-center ">
        <SidebarMenu className="w-full ">
          {menuItems.map((item, index) => (
            <TooltipProvider key={item.label}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Button 
                        variant="ghost" 
                        className={cn(
                          "w-full justify-center  transition-all duration-200 ease-in-out",
                          isCollapsed && "justify-center pl-6"
                        )}
                        onClick={handleNavigation}>
                        <item.icon className={cn("h-6 w-6", isCollapsed ? "mx-auto" : "mr-2")} />
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
      <SidebarFooter className="mt-auto">
        <Separator className="mb-4" />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" className={cn(
                "w-full  p-4 transition-all duration-200 ease-in-out",
                isCollapsed && ""
              )} onClick={handleLogout}>
                <LogOut className={cn("h-6 w-6", isCollapsed ? "mx-auto " : "mr-0")} />
              </Button>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent side="right">Logout</TooltipContent>}
          </Tooltip>
        </TooltipProvider>
        <Button
          variant="ghost"
          className={cn(
            "w-full flex items-center p-2  justify-center",
            isCollapsed ? "justify-center" : "justify-between"
          )}
          onClick={toggleSidebar}
        >
          {!isCollapsed && <span className="text-sm w-full">Collapse</span>}
          <ChevronRight className={cn("h-6 w-6 transition-transform", isCollapsed && "rotate-180")} />
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}

