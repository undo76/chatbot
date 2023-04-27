import Chatbot from "@/components/chatbot";
import Panel from "@/components/Panel";

function Home() {
  return (
    <div className="h-screen p-4 bg-gray-100">
      <Panel>
        <Chatbot />
      </Panel>
    </div>
  );
}

export default Home;
