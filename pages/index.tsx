import Chatbot from "@/components/chatbot";
import PageLayout from "@/components/page-layout";
import useAutoScroll from "@/libs/use-autoscroll";
import { useRef } from "react";

function Home() {
  const ref = useRef<HTMLDivElement>(null);
  useAutoScroll(ref);

  return (
    <PageLayout>
      <div ref={ref} className="h-full overflow-scroll p-10">
        <div className=" flex-1 max-w-5xl w-full">
          <Chatbot />
        </div>
      </div>
    </PageLayout>
  );
}

export default Home;
