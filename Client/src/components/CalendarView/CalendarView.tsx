import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import { requestsApi } from '@/services/api';
import { CalendarEvent, MaintenanceRequest, RequestType } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/common/Badges';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { CreateRequestModal } from '../Requests/CreateRequestModal';

const CalendarView: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<MaintenanceRequest | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const data = await requestsApi.getCalendarEvents();
      // Filter to only show preventive maintenance
      const preventiveEvents = (data || []).filter((e) => e.type === 'preventive');
      setEvents(preventiveEvents);
    } catch (error: any) {
      console.error('Error loading calendar:', error);
      // Set empty array on error so page still renders
      setEvents([]);
      // Only show toast if it's not a network error (backend might not be running)
      if (error.code !== 'ERR_NETWORK' && error.code !== 'ECONNREFUSED') {
        toast({
          title: 'Error loading calendar',
          description: error.response?.data?.message || 'Failed to load calendar events',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateClick = (arg: any) => {
    setSelectedDate(arg.date);
    setIsCreateModalOpen(true);
  };

  const handleEventClick = async (arg: any) => {
    try {
      const request = await requestsApi.getById(arg.event.id);
      setSelectedEvent(request);
    } catch (error: any) {
      console.error('Error loading request:', error);
      if (error.code !== 'ERR_NETWORK' && error.code !== 'ECONNREFUSED') {
        toast({
          title: 'Error loading request',
          description: error.response?.data?.message || 'Failed to load request details',
          variant: 'destructive',
        });
      }
    }
  };

  const getEventColor = (event: CalendarEvent) => {
    switch (event.status) {
      case 'new':
        return '#3b82f6'; // blue
      case 'in_progress':
        return '#f59e0b'; // orange
      case 'repaired':
        return '#10b981'; // green
      case 'scrap':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  const calendarEvents = events.map((event) => ({
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end,
    backgroundColor: getEventColor(event),
    borderColor: getEventColor(event),
    extendedProps: {
      type: event.type,
      status: event.status,
      equipmentName: event.equipmentName,
      assignedToName: event.assignedToName,
    },
  }));

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-bold">Preventive Maintenance Calendar</h2>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Maintenance
        </Button>
      </div>

      {/* Calendar */}
      <Card>
        <CardContent className="p-4">
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            events={calendarEvents}
            dateClick={handleDateClick}
            eventClick={handleEventClick}
            editable={true}
            selectable={true}
            dayMaxEvents={true}
            height="auto"
            eventDisplay="block"
            eventTimeFormat={{
              hour: '2-digit',
              minute: '2-digit',
              meridiem: 'short',
            }}
            slotMinTime="06:00:00"
            slotMaxTime="20:00:00"
          />
        </CardContent>
      </Card>

      {/* Create Request Modal */}
      {isCreateModalOpen && (
        <CreateRequestModal
          open={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setSelectedDate(null);
          }}
          initialDate={selectedDate}
          initialType="preventive"
          onSuccess={() => {
            loadEvents();
            setIsCreateModalOpen(false);
            setSelectedDate(null);
          }}
        />
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{selectedEvent.subject}</span>
                <StatusBadge status={selectedEvent.status} />
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Equipment</p>
                  <p className="text-sm font-semibold">
                    {selectedEvent.equipment?.name || 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <Badge variant="outline" className="capitalize">
                    {selectedEvent.type}
                  </Badge>
                </div>
                {selectedEvent.scheduledDate && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Scheduled Date</p>
                    <p className="text-sm font-semibold">
                      {new Date(selectedEvent.scheduledDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {selectedEvent.assignedTo && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Assigned To</p>
                    <p className="text-sm font-semibold">{selectedEvent.assignedTo.name}</p>
                  </div>
                )}
              </div>
              {selectedEvent.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Description</p>
                  <p className="text-sm">{selectedEvent.description}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CalendarView;

