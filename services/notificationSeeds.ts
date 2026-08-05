import { OperationalNotification } from '../types';

export const SEED_NOTIFICATIONS: OperationalNotification[] = [
  {
    id: 'notif-1',
    type: 'ALERT',
    title: 'Delay Alert — K-03 Faculty Express',
    message: 'Faculty Express delayed 6 min at College of Engineering.',
    time: '07:14 AM',
    read: false,
    stopName: 'College of Engineering',
    routeNumber: 'K-03',
  },
  {
    id: 'notif-2',
    type: 'INFO',
    title: 'Schedule Added',
    message: 'New schedule added: K-01 06:15 departure.',
    time: '07:10 AM',
    read: true,
    stopName: 'Tech Junction',
    routeNumber: 'K-01',
  },
  {
    id: 'notif-3',
    type: 'ALERT',
    title: 'Capacity Alert',
    message: 'Continental Roundabout at 89% capacity.',
    time: '07:05 AM',
    read: false,
    stopName: 'Continental Roundabout',
    routeNumber: 'K-01',
  },
];
