import { openaiCall, anthropicCall } from "@/lib/ai-calls";
import Flow from "./(routes)/canvas/page";

export default async function Page() {
  // const openaiResponse = await openaiCall("Hello, how are you?");
  // console.log(openaiResponse);

  // const anthropicResponse = await anthropicCall("Hello, how are you?");
  // console.log(anthropicResponse);

  return (
    <div className=" w-[100vw] h-[100vh] flex justify-center items-center overflow-hidden" >
      <div className=" h-[90vh] w-[90vw] bg-red-500/10  border border-red-500">
        <Flow />
      </div>  
    </div>
  );
}