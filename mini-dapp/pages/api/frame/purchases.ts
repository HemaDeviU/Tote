import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { fid } = req.query

    // Generate frame image showing purchase history
    const frameImage = await generateFrameImage({
      title: 'My Purchases',
      subtitle: `Farcaster ID: ${fid}`,
      action: 'View your encrypted product purchases'
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
    console.error('Purchases frame error:', error)
    return res.status(500).json({ error: 'Failed to load purchases' })
  }
}

async function generateFrameImage(data: { title: string; subtitle: string; action: string }) {
  // In a real implementation, you would generate an image using Canvas API or similar
  return `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame-image?title=${encodeURIComponent(data.title)}&subtitle=${encodeURIComponent(data.subtitle)}&action=${encodeURIComponent(data.action)}`
}
