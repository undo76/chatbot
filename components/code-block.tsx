import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

import { default as dracula } from "react-syntax-highlighter/dist/cjs/styles/hljs/dracula";

interface CodeBlockProps {
  language: string;
  children: string;
}

export default function CodeBlock({ language, children }: CodeBlockProps) {
  return (
    <SyntaxHighlighter language={language} style={dracula}>
      {children}
    </SyntaxHighlighter>
  );
}
