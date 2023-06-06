import {
  ChatBubbleLeftRightIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { classNames } from "@/libs/class-names";
import LinkButton from "@/components/link-button";
import { useChatSessions } from "@/libs/use-chat";
import { ChatSession } from "@/libs/db";

export function ChatSessions({}: {}) {
  const chatSessions = useChatSessions();

  if (!chatSessions) return <div>Loading...</div>;

  return (
    <>
      <div className="text-xs font-semibold leading-6 text-gray-400 flex gap-3">
        <ChatBubbleLeftRightIcon
          className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-white"
          aria-hidden="true"
        />
        Chat History
      </div>
      <ul role="list" className="-mx-2 mt-2 space-y-0">
        {chatSessions?.map((chatSession: ChatSession) => (
          <li key={chatSession.name}>
            <a
              className={classNames(
                "text-gray-400 hover:text-white hover:bg-gray-800",
                "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-normal"
              )}
            >
              <span className="truncate">{chatSession.name}</span>
              <LinkButton
                icon={PencilIcon}
                size="xs"
                className="ml-auto text-gray-500 hover:text-white"
              >
                <span className="sr-only">Edit chat</span>
              </LinkButton>
              <LinkButton
                icon={TrashIcon}
                size="xs"
                className="text-gray-500 hover:text-white"
              >
                <span className="sr-only">Delete chat</span>
              </LinkButton>
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
