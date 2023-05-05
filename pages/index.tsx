import Chatbot from "@/components/chatbot";
import Panel from "@/components/Panel";
import PageLayout from "@/components/page-layout";

function Home() {
  return (
    <PageLayout>
      <div className="bg-gray-100 flex justify-center overflow-scroll h-full">
        <div className="max-w-5xl w-full p-10">
          <Chatbot />
        </div>
      </div>
    </PageLayout>
  );
}

export default Home;
