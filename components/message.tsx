import { classNames } from "@/libs/class-names";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yDark as style } from "react-syntax-highlighter/dist/cjs/styles/prism";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css"; // `rehype-katex` does not import the CSS for you;
import ReactMarkdown from "react-markdown";
import React, { useEffect } from "react";
import mermaid from "mermaid";
import CodeSection from "@/components/code-section";

interface MessageProps {
  message: string;
  role: "human" | "ai" | "system" | "generic";
  error?: string;
  partial?: boolean;
  nTokens?: number;
}

function Message({
  message,
  role,
  error,
  partial = false,
  nTokens,
}: MessageProps): JSX.Element {
  useEffect(() => {
    if (!partial && message.includes("```mermaid")) {
      mermaid.init(undefined, document.querySelectorAll(".mermaid"));
    }
  });

  return (
    <div
      className={classNames(
        "rounded py-3 px-4 text-sm break-words overflow-x-auto shadow relative ",
        role === "human"
          ? "bg-orange-100 "
          : role === "ai"
          ? "bg-gray-50"
          : "bg-blue-50 hidden",
        partial && "shadow shadow-md"
      )}
    >
      {nTokens ? (
        <div className="absolute bottom-1 right-1 p-1 text-xs opacity-50 bg-gray-200 rounded font-mono ">
          {nTokens}
        </div>
      ) : null}
      <div>
        <ReactMarkdown
          remarkPlugins={[remarkMath, remarkGfm]}
          rehypePlugins={[rehypeKatex, rehypeRaw]}
          skipHtml={false}
          remarkRehypeOptions={{
            allowDangerousHtml: true,
            // passThrough: ["html"],
            // passThrough: ["span"],
          }}
          className="prose prose-sm max-w-none"
          // disallowedElements={["p"]}
          unwrapDisallowed={true}
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              return !inline ? (
                match && match[1] === "mermaid" ? (
                  // <div className="not-prose">
                  <CodeSection code={String(children).replace(/\n$/, "")}>
                    <div className="flex flex-row justify-around">
                      <code className="mermaid text-sm flex-1">
                        {String(children).replace(/\n$/, "")}
                      </code>
                    </div>
                  </CodeSection>
                ) : (
                  <CodeSection code={String(children).replace(/\n$/, "")}>
                    <SyntaxHighlighter
                      {...props}
                      codeTagProps={{ className: "text-xs" }}
                      style={style}
                      language={match?.[1] || "text"}
                      // PreTag="div"
                      showInlineLineNumbers={true}
                      wrapLines={true}
                      wrapLongLines={true}
                      showLineNumbers={false}
                    >
                      {String(children).replace(/\n$/, "")}
                    </SyntaxHighlighter>
                  </CodeSection>
                )
              ) : (
                // Inline code
                <code {...props} className={className}>
                  {children}
                </code>
              );
            },
            pre({ node, className, children, ...props }) {
              return (
                <div className="not-prose">
                  <pre className="text-xs">{children}</pre>
                </div>
              );
            },
            p({ node, className, children, ...props }) {
              return <p {...props}>{children}</p>;
            },
          }}
        >
          {message + (partial ? " ▌" : "")}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export default React.memo(Message);
