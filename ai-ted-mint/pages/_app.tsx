import type { AppProps } from "next/app";
import { ChainId, ThirdwebProvider } from "@thirdweb-dev/react";
import "../styles/globals.css";
import Head from "next/head";
import ThirdwebGuideFooter from "../components/GitHubLink";

// This is the chainId your dApp will work on.
//const activeChainId = ChainId.Mumbai;
const activeChainId = ChainId.Goerli;

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider activeChain={activeChainId}>
      <Head>
        <title>FOTF | AI Ted Mint</title>
        <link
        href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap&family=Roboto"
        rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="Fully Generated Recreation of the Original 9671 Fury Teds from Fury Of The Fur. Artwork created by a community member using Starry AI. No Utility. Just Art and Testing."
        />
        <meta
          name="keywords"
          content="FOTF, AI Teds, AI Ted Mint, fury of the fur"
        />
      </Head>
      {/* @ts-expect-error Server Component */} 
      <Component {...pageProps} />
      <ThirdwebGuideFooter />
    </ThirdwebProvider>
  );
}

export default MyApp;
