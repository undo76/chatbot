import Chatbot from "@/components/chatbot";
import PageLayout from "@/components/page-layout";
import useAutoScroll from "@/libs/use-autoscroll";
import { useRef } from "react";
import { useRouter } from "next/router";
import { useChatSession } from "@/libs/use-chat";

function ChatPageLayout() {
  const ref = useRef<HTMLDivElement>(null);
  useAutoScroll(ref);

  const sessionId = useRouter().query.id as string;
  const chatSession = useChatSession(
    sessionId ? parseInt(sessionId) : undefined
  );

  return (
    <PageLayout>
      <div ref={ref} className="h-full overflow-scroll p-10">
        <div className="text font-semibold leading-6 text-gray-400 mb-6 ">
          {chatSession?.name ?? "New Chat"}
        </div>
        <Chatbot sessionId={sessionId ? parseInt(sessionId) : undefined} />
      </div>
    </PageLayout>
  );
}

export default ChatPageLayout;
