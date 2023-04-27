import { classNames } from "@/libs/class-names";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yDark as style } from "react-syntax-highlighter/dist/cjs/styles/prism";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css"; // `rehype-katex` does not import the CSS for you;
import ReactMarkdown from "react-markdown";

interface MessageProps {
  message: string;
  role: "human" | "ai" | "system" | "generic";
  error?: string;
  partial?: boolean;
}

export default function Message({
  message,
  role,
  error,
  partial = false,
}: MessageProps): JSX.Element {
  return (
    <div
      className={classNames(
        "rounded m-1 p-2 text-sm",
        role === "human"
          ? "bg-blue-100"
          : role === "ai"
          ? "bg-gray-100"
          : "hidden"
      )}
    >
      <div>
        <ReactMarkdown
          remarkPlugins={[remarkMath, remarkGfm]}
          rehypePlugins={[rehypeKatex, rehypeRaw]}
          // skipHtml={false}
          remarkRehypeOptions={{
            allowDangerousHtml: false,
            // passThrough: ["html"],
            passThrough: ["span"],
          }}
          className="prose prose-sm max-w-none"
          // disallowedElements={["p"]}
          unwrapDisallowed={true}
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              return !inline && match ? (
                <SyntaxHighlighter
                  {...props}
                  codeTagProps={{ className: "text-xs" }}
                  style={style}
                  language={match[1]}
                  // PreTag="div"
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              ) : (
                <code {...props} className={className}>
                  {children}
                </code>
              );
            },
            pre({ node, className, children, ...props }) {
              return (
                <div className="not-prose">
                  <pre className="text-sm">{children}</pre>
                </div>
              );
            },
            p({ node, className, children, ...props }) {
              return <p {...props}>{children}</p>;
            },
          }}
        >
          {/*{message +*/}
          {/*  (partial*/}
          {/*    ? "<span class='text-gray-500 animate-[ping_0.5s_ease-in-out_infinite]'>▌</span>"*/}
          {/*    : "")}*/}
          {message + (partial ? "▌" : "")}
        </ReactMarkdown>
        {/*<pre className="whitespace-pre-wrap">{message}</pre>*/}
      </div>
    </div>
  );
}
