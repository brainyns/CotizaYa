import type { QuoteStatus } from '../types/quote';
import { QUOTE_STATUS_COLORS, QUOTE_STATUS_LABELS } from '../types/quote';

interface Props {
  status: QuoteStatus;
}

export function QuoteStatusBadge({ status }: Props) {
  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${QUOTE_STATUS_COLORS[status]}`}
    >
      {QUOTE_STATUS_LABELS[status]}
    </span>
  );
}