import type { NextPage } from 'next'
import Head from 'next/head'
import { useState, useEffect } from 'react'
import { ToteFlowMarketplace } from '../components/ToteFlowMarketplace'
import { LitProvider } from '../contexts/LitContext'
import { WagmiProvider } from '../contexts/WagmiContext'

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>ToteFlow Marketplace - Farcaster Mini Dapp</title>
        <meta name="description" content="Decentralized marketplace with encrypted IPFS content on Base chain" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Farcaster Frame Meta Tags */}
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="https://toteflow.vercel.app/frame-image.png" />
        <meta property="fc:frame:button:1" content="Browse Products" />
        <meta property="fc:frame:button:2" content="My Purchases" />
        <meta property="fc:frame:button:3" content="List Product" />
        <meta property="fc:frame:post_url" content="https://toteflow.vercel.app/api/frame" />
      </Head>

      <WagmiProvider>
        <LitProvider>
          <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 py-8">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  🛍️ ToteFlow Marketplace
                </h1>
                <p className="text-lg text-gray-600 mb-2">
                  Decentralized marketplace with encrypted IPFS content
                </p>
                <p className="text-sm text-gray-500">
                  Powered by Lit Protocol • Built on Base Chain • Farcaster Ready
                </p>
              </div>
              
              <ToteFlowMarketplace />
            </div>
          </main>
        </LitProvider>
      </WagmiProvider>
    </>
  )
}

export default Home
