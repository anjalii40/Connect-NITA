import React, { useState } from 'react';
import { CalendarIcon, MapPinIcon, ClockIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import Button from '../../components/UI/Button';

const EventsPage = () => {
  const [events] = useState([
    {
      id: 1,
      title: 'Alumni Networking Event',
      description: 'Join us for an evening of networking with fellow NITA alumni. Connect with professionals from various industries and expand your network.',
      date: '2024-02-15',
      time: '6:00 PM - 9:00 PM',
      location: 'San Francisco, CA',
      organizer: 'NITA Alumni Association',
      attendees: 45,
      maxAttendees: 100,
      type: 'Networking',
      image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 2,
      title: 'Tech Career Workshop',
      description: 'Learn about the latest trends in technology and get tips for advancing your career in the tech industry.',
      date: '2024-02-20',
      time: '2:00 PM - 5:00 PM',
      location: 'Seattle, WA',
      organizer: 'Tech Alumni Group',
      attendees: 32,
      maxAttendees: 50,
      type: 'Workshop',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 3,
      title: 'Annual Alumni Reunion',
      description: 'Our biggest event of the year! Celebrate with classmates and reconnect with old friends.',
      date: '2024-03-10',
      time: '5:00 PM - 11:00 PM',
      location: 'New York, NY',
      organizer: 'NITA Alumni Board',
      attendees: 120,
      maxAttendees: 200,
      type: 'Reunion',
      image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=800&q=80',
    },
  ]);

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'Networking':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Workshop':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Reunion':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Events
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Discover and join exciting events with your fellow alumni
        </p>
      </div>

      {/* Create Event Button */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Host an Event
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Create an event to bring the alumni community together
            </p>
          </div>
          <Button>
            <CalendarIcon className="h-5 w-5 mr-2" />
            Create Event
          </Button>
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-48 object-cover"
              />
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEventTypeColor(event.type)}`}>
                  {event.type}
                </span>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <UserGroupIcon className="h-4 w-4 mr-1" />
                  {event.attendees}/{event.maxAttendees}
                </div>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {event.title}
              </h3>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                {event.description}
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {new Date(event.date).toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <ClockIcon className="h-4 w-4 mr-2" />
                  {event.time}
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  {event.location}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Organized by {event.organizer}
                </p>
                <Button size="sm">
                  Register
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No events scheduled at the moment.
          </p>
        </div>
      )}
    </div>
  );
};

export default EventsPage; 