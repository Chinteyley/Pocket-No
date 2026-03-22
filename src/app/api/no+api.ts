import { getRandomNoReason } from '@/features/no/catalog';

export function GET() {
  return Response.json(getRandomNoReason());
}
