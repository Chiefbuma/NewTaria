'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { placeholderImages } from "@/lib/placeholder-images";

const userAvatar = placeholderImages.find(p => p.id === 'user-avatar');
const patientAvatar = placeholderImages.find(p => p.id === 'patient-avatar');

// In a real app, this data would be fetched and mapped dynamically
const userDetails = {
    'user-1': { name: 'Dr. Emily Carter', avatar: userAvatar?.imageUrl, fallback: 'EC' },
    'user-3': { name: 'Dr. Ben Stone', avatar: userAvatar?.imageUrl, fallback: 'BS' },
    'patient-1': { name: 'John Doe', avatar: patientAvatar?.imageUrl, fallback: 'JD' },
};

const mockNotifications = [
    { id: 1, senderId: 'user-1', message: 'Just checking in on your blood sugar readings for this week.', timestamp: '2h ago' },
    { id: 2, senderId: 'user-3', message: 'Please remember to take your evening medication.', timestamp: '8h ago' },
    { id: 3, senderId: 'patient-1', message: 'I\'m feeling much better today, thanks for checking in!', timestamp: '1d ago' },
];


export default function Notifications() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    <span>Notifications</span>
                </CardTitle>
                <CardDescription>Recent messages from patients and staff.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {mockNotifications.map(notification => {
                    const sender = userDetails[notification.senderId as keyof typeof userDetails] || { name: 'Unknown', avatar: '', fallback: 'U' };
                    return (
                        <div key={notification.id} className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg transition-colors hover:bg-muted/80">
                            <Avatar className="h-9 w-9 border">
                                <AvatarImage src={sender.avatar} alt={sender.name} />
                                <AvatarFallback>{sender.fallback}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <div className="flex items-baseline justify-between">
                                    <p className="font-semibold text-sm">{sender.name}</p>
                                    <p className="text-xs text-muted-foreground">{notification.timestamp}</p>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
                            </div>
                        </div>
                    )
                })}
                 <Button variant="outline" className="w-full mt-2">View All Messages</Button>
            </CardContent>
        </Card>
    );
}
