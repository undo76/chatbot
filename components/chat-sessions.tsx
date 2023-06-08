import {
  ChatBubbleLeftRightIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { classNames } from "@/libs/class-names";
import LinkButton from "@/components/link-button";
import { deleteChatSession, useChatSessions } from "@/libs/use-chat";
import { ChatSession } from "@/libs/db";
import Link from "next/link";
import { useRouter } from "next/router";

export function ChatSessions({}: {}) {
  const chatSessions = useChatSessions();
  const router = useRouter();

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
            <Link
              href={`/chat/${chatSession.id}`}
              className={classNames(
                "text-gray-400 hover:text-white hover:bg-gray-800",
                "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-normal"
              )}
            >
              <span className="truncate mr-auto">{chatSession.name}</span>
              {/*<LinkButton*/}
              {/*  icon={PencilIcon}*/}
              {/*  size="xs"*/}
              {/*  className="ml-auto text-gray-500 hover:text-white"*/}
              {/*>*/}
              {/*  <span className="sr-only">Edit chat</span>*/}
              {/*</LinkButton>*/}
              <LinkButton
                icon={TrashIcon}
                size="xs"
                className="text-gray-500 hover:text-white"
                onClick={async () => {
                  if (
                    confirm(
                      `Are you sure you want to delete "${chatSession.name}"?`
                    )
                  ) {
                    await deleteChatSession(chatSession.id!);
                    await router.replace("/chat");
                  }
                }}
              >
                <span className="sr-only">Delete chat</span>
              </LinkButton>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
