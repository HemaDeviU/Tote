import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { untrustedData } = req.body

    if (!untrustedData) {
      return res.status(400).json({ error: 'Missing untrustedData' })
    }

    const { buttonIndex, fid } = untrustedData

    // Handle different button clicks
    switch (buttonIndex) {
      case 1: // Browse Products
        return res.status(200).json({
          type: 'frame',
          frame: {
            image: `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/browse`,
            buttons: [
              {
                label: 'View Products',
                action: 'post'
              },
              {
                label: 'Refresh',
                action: 'post'
              }
            ],
            postUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/browse`
          }
        })

      case 2: // My Purchases
        return res.status(200).json({
          type: 'frame',
          frame: {
            image: `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/purchases?fid=${fid}`,
            buttons: [
              {
                label: 'View Purchases',
                action: 'post'
              },
              {
                label: 'Back to Menu',
                action: 'post'
              }
            ],
            postUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/purchases`
          }
        })

      case 3: // List Product
        return res.status(200).json({
          type: 'frame',
          frame: {
            image: `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/list`,
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

      default:
        return res.status(200).json({
          type: 'frame',
          frame: {
            image: `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame/home`,
            buttons: [
              {
                label: 'Browse Products',
                action: 'post'
              },
              {
                label: 'My Purchases',
                action: 'post'
              },
              {
                label: 'List Product',
                action: 'post'
              }
            ],
            postUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame`
          }
        })
    }
  } catch (error) {
    console.error('Frame API error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
