import { fetchRemoteNoReason } from '@/features/no/remote-catalog';

export async function GET() {
  return Response.json(await fetchRemoteNoReason());
}
