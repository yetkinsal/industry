
import React from 'react';
import { EventData } from '../../types';

interface EventsTableProps {
  data: EventData[];
}

const getStatusColor = (type: EventData['type']) => {
    switch(type) {
        case 'Downtime': return 'bg-red-500';
        case 'Scrap': return 'bg-yellow-500';
        case 'Quality': return 'bg-blue-500';
        case 'Speed Loss': return 'bg-purple-500';
        default: return 'bg-gray-500';
    }
}

const EventsTable: React.FC<EventsTableProps> = ({ data }) => {
  return (
    <div className="overflow-y-auto h-full">
      <table className="w-full text-sm text-left text-text-secondary">
        <thead className="text-xs text-text-secondary uppercase bg-surface sticky top-0">
          <tr>
            <th scope="col" className="px-4 py-3">Timestamp</th>
            <th scope="col" className="px-4 py-3">Line</th>
            <th scope="col" className="px-4 py-3">Type</th>
            <th scope="col" className="px-4 py-3">Details</th>
            <th scope="col" className="px-4 py-3 text-right">Duration (min)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((event, index) => (
            <tr key={event.id} className={`border-b border-border ${index % 2 === 0 ? 'bg-surface' : 'bg-background'}`}>
              <td className="px-4 py-2 text-text-primary whitespace-nowrap">{event.timestamp}</td>
              <td className="px-4 py-2">{event.line}</td>
              <td className="px-4 py-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getStatusColor(event.type)}`}>
                  {event.type}
                </span>
              </td>
              <td className="px-4 py-2">{event.details}</td>
              <td className="px-4 py-2 text-right">{event.duration || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EventsTable;
