import { openaiCall, anthropicCall } from "@/lib/ai-calls";
import Flow from "./(routes)/canvas/page";
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/logout-button'


export default async function Page() {
  // const openaiResponse = await openaiCall("Hello, how are you?");
  // console.log(openaiResponse);

  // const anthropicResponse = await anthropicCall("Hello, how are you?");
  // console.log(anthropicResponse);

  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/login')
  

  return <p>Hello {data?.user?.email}</p>
}

  return (
    <div className="relative h-full w-full flex justify-center items-center overflow-hidden">

      <div className="h-full w-full bg-red-500/20 border border-red-500">
        <Flow />
      </div>  
    </div>
  );
}
