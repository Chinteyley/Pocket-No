import { fetchJsonCatalogNoReason } from '@/features/no/json-catalog';

export async function GET() {
  return Response.json(await fetchJsonCatalogNoReason());
}
