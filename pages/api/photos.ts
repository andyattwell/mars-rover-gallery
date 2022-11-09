// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

const uri = process.env.NASA_ENDPOINT
const KEY = process.env.NASA_API_KEY
type Params = {
  page: string,
  sol?: string,
  earth_date?: string,
  camera?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (!req.body.rover) {
    res.status(404)
  }

  let params = {
    page: req.body.page || '1'
  } as Params

  if (req.body.earth_date) {
    params.earth_date = req.body.earth_date?.toString()
  } else if (req.body.sol) {
    params.sol = req.body.sol?.toString()
  }
  
  if (req.body.camera) {
    params.camera = req.body.camera?.toString()
  }

  const searchParams = new URLSearchParams(params).toString();
  let endpoint = uri + '/rovers/' + req.body.rover + '/photos?api_key=' + KEY + '&' + searchParams
  const response = await fetch(endpoint)
  const data = await response.json()
  res.status(200).json({body: req.body, photos: data.photos, endpoint: endpoint, filters: params})
}
