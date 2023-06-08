import React, { Fragment, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Bars3Icon, CogIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { classNames } from "@/libs/class-names";
import { PlusIcon } from "@heroicons/react/20/solid";
import { ChatSessions } from "@/components/chat-sessions";
import Overlay from "@/components/overlay";
import useAutoScroll from "@/libs/use-autoscroll";
import SettingsForm from "@/components/settings-form";
import Link from "next/link";

const navigation = [
  { name: "New Chat", href: "/chat", icon: PlusIcon, current: true },
  // { name: "Dashboard", href: "#", icon: HomeIcon, current: false },
  // { name: "Settings", href: "#", icon: CogIcon, current: false },

  // { name: "Team", href: "#", icon: UsersIcon, current: false },
  // { name: "Projects", href: "#", icon: FolderIcon, current: false },
  // { name: "Calendar", href: "#", icon: CalendarIcon, current: false },
  // { name: "Documents", href: "#", icon: DocumentDuplicateIcon, current: false },
  // { name: "Reports", href: "#", icon: ChartPieIcon, current: false },
];

export default function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <div className="h-screen flex flex-col bg-gray-100">
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog
            as="div"
            className="relative z-50 lg:hidden"
            onClose={setSidebarOpen}
          >
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" />
            </Transition.Child>

            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                      <button
                        type="button"
                        className="-m-2.5 p-2.5"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </Transition.Child>
                  {/* Sidebar component, swap this element with another sidebar if you like */}
                  <SidebarContents
                    settingsOpen={settingsOpen}
                    setSettingsOpen={(value) => {
                      setSettingsOpen(value);
                      setSidebarOpen(false);
                    }}
                  />
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <SidebarContents
            settingsOpen={settingsOpen}
            setSettingsOpen={setSettingsOpen}
          />
        </div>

        <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-gray-900 px-4 py-4 shadow-sm sm:px-6 lg:hidden">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-400 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex-1 text-sm font-semibold leading-6 text-white">
            ChaCha<span className="text-red-400">Chat</span>
          </div>
        </div>

        <main className="lg:ml-72 flex-grow overflow-hidden">{children}</main>
      </div>
      <Overlay title="Settings" open={settingsOpen} setOpen={setSettingsOpen}>
        <SettingsForm />
      </Overlay>
    </>
  );
}

function SidebarContents({
  setSettingsOpen,
}: {
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
}) {
  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-900 px-6">
      <div className="flex h-16 shrink-0 items-center">
        <img
          className="h-8 w-auto"
          src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
          alt="Your Company"
        />
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={classNames(
                      item.current
                        ? "bg-gray-800 text-white"
                        : "text-gray-400 hover:text-white hover:bg-gray-800",
                      "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                    )}
                  >
                    <item.icon
                      className="h-6 w-6 shrink-0"
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  className={classNames(
                    "text-gray-400 hover:text-white hover:bg-gray-800",
                    "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold"
                  )}
                  onClick={() => setSettingsOpen(true)}
                >
                  <CogIcon className="h-6 w-6 shrink-0" aria-hidden="true" />
                  Settings
                </a>
              </li>
            </ul>
          </li>
          <li>
            <ChatSessions />
          </li>
          {/*<li className="-mx-6 mt-auto">*/}
          {/*  <a*/}
          {/*    href="#"*/}
          {/*    className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-white hover:bg-gray-800"*/}
          {/*  >*/}
          {/*    <img*/}
          {/*      className="h-8 w-8 rounded-full bg-gray-800"*/}
          {/*      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"*/}
          {/*      alt=""*/}
          {/*    />*/}
          {/*    <span className="sr-only">Your profile</span>*/}
          {/*    <span aria-hidden="true">Tom Cook</span>*/}
          {/*  </a>*/}
          {/*</li>*/}
        </ul>
      </nav>
    </div>
  );
}
