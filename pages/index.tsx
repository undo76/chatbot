import Chatbot from "@/components/chatbot";
import Panel from "@/components/Panel";
import PageLayout from "@/components/page-layout";

const chatHistory = [
  { id: 1, name: "Heroicons", href: "#", initial: "H", current: false },
  { id: 2, name: "Tailwind Labs", href: "#", initial: "T", current: false },
  { id: 3, name: "Workcation", href: "#", initial: "W", current: false },
];

function Home() {
  return (
    <PageLayout>
      <div className="min-h-screen p-4 bg-gray-100 flex justify-center  border">
        <div className="w-full max-w-5xl">
          <Panel>
            <Chatbot />
          </Panel>
        </div>
      </div>
    </PageLayout>
  );
}

export default Home;
