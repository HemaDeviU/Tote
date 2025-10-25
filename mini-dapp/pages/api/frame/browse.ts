import { NextApiRequest, NextApiResponse } from 'next'
import { ToteFlowContract } from '../../utils/contract'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const contract = new ToteFlowContract()
    const totalProducts = await contract.getTotalProducts()
    
    // Generate frame image showing product count
    const frameImage = await generateFrameImage({
      title: 'ToteFlow Marketplace',
      subtitle: `${totalProducts} products available`,
      action: 'Browse encrypted products on Base chain'
    })

    return res.status(200).json({
      type: 'frame',
      frame: {
        image: frameImage,
        buttons: [
          {
            label: 'Open Marketplace',
            action: 'link',
            target: `${process.env.NEXT_PUBLIC_BASE_URL}`
          },
          {
            label: 'Back to Menu',
            action: 'post'
          }
        ],
        postUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame`
      }
    })
  } catch (error) {
    console.error('Browse frame error:', error)
    return res.status(500).json({ error: 'Failed to load products' })
  }
}

async function generateFrameImage(data: { title: string; subtitle: string; action: string }) {
  // In a real implementation, you would generate an image using Canvas API or similar
  // For now, return a placeholder URL
  return `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame-image?title=${encodeURIComponent(data.title)}&subtitle=${encodeURIComponent(data.subtitle)}&action=${encodeURIComponent(data.action)}`
}
