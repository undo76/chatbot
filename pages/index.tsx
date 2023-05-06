import Chatbot from "@/components/chatbot";
import Panel from "@/components/Panel";
import PageLayout from "@/components/page-layout";
import useAutoScroll from "@/libs/use-autoscroll";
import { useRef } from "react";

function Home() {
  const ref = useRef<HTMLDivElement>(null);
  useAutoScroll(ref);
  return (
    <PageLayout>
      <div ref={ref} className="flex justify-center overflow-scroll h-full">
        <div className="max-w-5xl w-full p-10">
          <Chatbot />
        </div>
      </div>
    </PageLayout>
  );
}

export default Home;
