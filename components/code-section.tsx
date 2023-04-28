import { ReactNode, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { CheckIcon, ClipboardIcon } from "@heroicons/react/24/outline";

interface CodeSectionProps {
  code: string;
  timeout?: number;
  children: ReactNode;
}

export default function CodeSection({
  code,
  timeout = 1000,
  children,
}: CodeSectionProps): JSX.Element {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, timeout);
  };

  return (
    <div className="relative">
      {children}
      <div className="absolute top-2 right-2">
        <CopyToClipboard text={code} onCopy={handleCopy}>
          <button className=" text-gray-300 bg-gray-700 hover:bg-gray-600 p-1 rounded text-sm opacity-75">
            {copied ? (
              <CheckIcon className="h-4 w-4" />
            ) : (
              <ClipboardIcon className="h-4 w-4" />
            )}
          </button>
        </CopyToClipboard>
      </div>
    </div>
  );
}
