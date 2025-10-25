import { NextApiRequest, NextApiResponse } from 'next'
import { createCanvas } from 'canvas'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { title, subtitle, action } = req.query

    // Create canvas for frame image
    const canvas = createCanvas(1200, 630)
    const ctx = canvas.getContext('2d')

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 1200, 630)
    gradient.addColorStop(0, '#3B82F6')
    gradient.addColorStop(1, '#1E40AF')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 1200, 630)

    // Title
    ctx.fillStyle = '#FFFFFF'
    ctx.font = 'bold 48px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(title as string, 600, 200)

    // Subtitle
    ctx.font = '24px Arial'
    ctx.fillText(subtitle as string, 600, 280)

    // Action
    ctx.font = '20px Arial'
    ctx.fillText(action as string, 600, 350)

    // ToteFlow branding
    ctx.font = 'bold 32px Arial'
    ctx.fillText('🛍️ ToteFlow Marketplace', 600, 450)
    ctx.font = '18px Arial'
    ctx.fillText('Powered by Lit Protocol • Built on Base Chain', 600, 480)

    // Convert to buffer
    const buffer = canvas.toBuffer('image/png')

    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Cache-Control', 'public, max-age=3600')
    res.status(200).send(buffer)
  } catch (error) {
    console.error('Frame image error:', error)
    res.status(500).json({ error: 'Failed to generate frame image' })
  }
}
