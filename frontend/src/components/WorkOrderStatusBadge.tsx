import type { WorkOrderStatus } from '../types/workOrder';
import {
  WORK_ORDER_STATUS_COLORS,
  WORK_ORDER_STATUS_LABELS,
} from '../types/workOrder';

interface Props {
  status: WorkOrderStatus;
}

export function WorkOrderStatusBadge({ status }: Props) {
  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${WORK_ORDER_STATUS_COLORS[status]}`}
    >
      {WORK_ORDER_STATUS_LABELS[status]}
    </span>
  );
}