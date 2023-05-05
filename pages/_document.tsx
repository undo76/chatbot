import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" className="h-full bg-white">
      <Head>
        {/*<script*/}
        {/*  src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"*/}
        {/*  async*/}
        {/*></script>*/}
        {/*<script*/}
        {/*  // eslint-disable-next-line react/no-danger*/}
        {/*  dangerouslySetInnerHTML={{*/}
        {/*    __html: `mermaid.initialize({startOnLoad: true});`,*/}
        {/*  }}*/}
        {/*/>*/}
      </Head>
      <body className="h-full">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
