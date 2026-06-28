import type { ChainEventType } from '../types/demo';

const badgeClass: Record<ChainEventType, string> = {
  ItemCreated: 'badge-created',
  ItemPurchased: 'badge-purchased',
  ItemDelivered: 'badge-delivered',
  TradeFinalized: 'badge-finalized',
  DisputeOpened: 'badge-dispute',
  DisputeResolved: 'badge-finalized',
  RefundRequested: 'badge-refund',
  VoteSubmitted: 'badge-vote',
};

export function EventLog({ events }: { events: Array<{ id: string; time: string; type: ChainEventType; description: string; txHash: string }> }) {
  return (
    <div className="events-list">
      {events.map((event) => (
        <div key={event.id} className="event-item" data-event-id={event.id}>
          <span className="event-time">{event.time}</span>
          <span className={`event-badge ${badgeClass[event.type]}`}>{event.type}</span>
          <span className="event-desc">{event.description}</span>
          <span className="event-hash">{event.txHash}</span>
        </div>
      ))}
    </div>
  );
}
