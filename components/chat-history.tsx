import {
  ChatBubbleLeftRightIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { classNames } from "@/libs/class-names";
import LinkButton from "@/components/link-button";
import { useEffect, useState } from "react";

export function ChatHistory({}: {}) {
  // chatHistory is stored in the LocalStorage
  // const chatHistory = [];

  const [chatHistory, setChatHistory] = useState([]);
  useEffect(() => {
    const chatHistory = localStorage.getItem("chatHistory");
    if (chatHistory) {
      setChatHistory(JSON.parse(chatHistory));
    }
  }, []);

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
        {chatHistory.map((chat) => (
          <li key={chat.name}>
            <a
              href={chat.href}
              className={classNames(
                chat.current
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800",
                "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-normal"
              )}
            >
              {/*<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-[0.625rem] font-medium text-gray-400 group-hover:text-white">*/}
              {/*  {chat.initial}*/}
              {/*</span>*/}

              <span className="truncate">{chat.name}</span>
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
