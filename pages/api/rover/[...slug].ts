import type { NextApiRequest, NextApiResponse } from 'next'
const uri = process.env.NASA_ENDPOINT
const KEY = process.env.NASA_API_KEY

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { slug } = req.query
  let endpoint = uri + '/manifests/' + slug + '?api_key=' + KEY
  const response = await fetch(endpoint)
  console.log({response})
  const data = await response.json()
  res.status(200).json(data.photo_manifest)
}
