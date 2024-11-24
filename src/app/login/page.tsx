"use client"

import { useState } from "react"
import { login, signup } from './actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useFormStatus } from "react-dom"
import { Loader2 } from "lucide-react"

import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button className="w-full" type="submit" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Logging in...
        </>
      ) : (
        'Log in'
      )}
    </Button>
  )
}

export default function LoginPage() {
  const [error, setError] = useState<string>("")
  const { toast } = useToast()
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    try {
      setError("")
      const result = await login(formData)
      
      if (result.error) {
        setError(result.error)
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error,
        })
      } else if (result.success) {
        toast({
          title: "Success",
          description: "Logged in successfully",
        })
        router.push('/') // Client-side redirect
        router.refresh() // Refresh the page to update auth state
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Something went wrong"
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      })
    }
  }

  return (
    <div className="overflow-hidden flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <h2 className="text-2xl font-bold text-center">Welcome back</h2>
          <p className="text-muted-foreground text-center">Enter your credentials to continue</p>
        </CardHeader>
        <form action={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="text-sm text-destructive text-center">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <SubmitButton />
            <Button 
              className="w-full" 
              variant="outline" 
              formAction={signup}
            >
              Create account
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}