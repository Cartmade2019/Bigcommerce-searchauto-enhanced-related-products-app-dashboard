import { NextApiRequest, NextApiResponse } from 'next';
import { bigcommerceClient, getSession } from '../../../lib/auth';
import { getStoreDataByStoreHash } from '@lib/dbs/mysql';

export default async function products(req: NextApiRequest, res: NextApiResponse) {
  const {
    body,
    query: { storeid },
    method,
  } = req;

  switch (method) {
    case 'PUT':
      try {
        // const result = await getStoreDataByStoreHash('asd');
        // res.status(200).json(result);
      } catch (error) {
        const { message, response } = error;
        res.status(response?.status || 500).json({ message });
      }
      break;
    default:
      res.setHeader('Allow', ['PUT']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
