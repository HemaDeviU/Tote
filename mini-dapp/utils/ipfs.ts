import { create } from 'ipfs-http-client'

// Initialize IPFS client with flexible configuration
const getIPFSClient = () => {
  const url = process.env.NEXT_PUBLIC_IPFS_URL || 'https://ipfs.io/api/v0'
  const auth = process.env.NEXT_PUBLIC_IPFS_AUTH || ''
  
  const config: any = { url }
  
  if (auth) {
    config.headers = { authorization: auth }
  }
  
  return create(config)
}

export const uploadToIPFS = async (data: any): Promise<string> => {
  try {
    const ipfs = getIPFSClient()
    
    // Convert data to buffer if it's not already
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(JSON.stringify(data))
    
    // Upload to IPFS
    const result = await ipfs.add(buffer)
    
    console.log('✅ File uploaded to IPFS:', result.path)
    return result.path
  } catch (error) {
    console.error('❌ Error uploading to IPFS:', error)
    throw new Error('Failed to upload to IPFS')
  }
}

export const downloadFromIPFS = async (hash: string): Promise<any> => {
  try {
    const ipfs = getIPFSClient()
    
    // Download from IPFS
    const chunks = []
    for await (const chunk of ipfs.cat(hash)) {
      chunks.push(chunk)
    }
    
    const data = Buffer.concat(chunks)
    
    console.log('✅ File downloaded from IPFS:', hash)
    return data
  } catch (error) {
    console.error('❌ Error downloading from IPFS:', error)
    throw new Error('Failed to download from IPFS')
  }
}

export const getIPFSUrl = (hash: string): string => {
  // Return IPFS gateway URL
  return `https://ipfs.io/ipfs/${hash}`
}
