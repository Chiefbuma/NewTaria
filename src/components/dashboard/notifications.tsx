
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Bell, MessageSquare, Loader2 } from 'lucide-react';
import { fetchMessages } from '@/lib/api-service';
import type { Message, User } from '@/lib/types';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export default function Notifications() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('loggedInUser');
        if (stored) {
            const user = JSON.parse(stored);
            setCurrentUser(user);
            loadNotifications(user.id);
        }
    }, []);

    const loadNotifications = async (userId: number) => {
        try {
            // Load all messages for the current user
            const data = await fetchMessages();
            // Filter only messages received by the user, and sort by date
            const received = data
                .filter(m => m.receiver_id === userId)
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 5); // Show latest 5
            
            setMessages(received);
        } catch (e) {
            console.error('Failed to load notifications:', e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="border-primary/10">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    <span>Notifications</span>
                </CardTitle>
                <CardDescription>Recent messages from patients and staff.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading ? (
                    <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : messages.length > 0 ? (
                    messages.map(msg => (
                        <div key={msg.id} className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg transition-colors hover:bg-muted/80">
                            <Avatar className="h-9 w-9 border border-primary/10">
                                <AvatarImage src={msg.sender_avatar} alt={msg.sender_name} />
                                <AvatarFallback className="bg-primary/5 text-primary">{msg.sender_name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 overflow-hidden">
                                <div className="flex items-baseline justify-between gap-2">
                                    <p className="font-semibold text-sm truncate">{msg.sender_name}</p>
                                    <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                                        {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                                    </p>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{msg.content}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8">
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                            <MessageSquare className="h-5 w-5 text-muted-foreground/40" />
                        </div>
                        <p className="text-xs text-muted-foreground">No recent messages in your inbox.</p>
                    </div>
                )}
                 <Button asChild variant="outline" className="w-full mt-2 border-primary/20 hover:bg-primary/5">
                    <Link href="/dashboard/messages">View All Messages</Link>
                 </Button>
            </CardContent>
        </Card>
    );
}
