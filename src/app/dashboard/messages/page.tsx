'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send, Loader2, User as UserIcon, Search } from 'lucide-react';
import { fetchMessages, sendMessage } from '@/lib/api-service';
import { fetchUsers } from '@/lib/data';
import type { Message, User } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function MessagingPage() {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    useEffect(() => {
        const stored = localStorage.getItem('loggedInUser');
        if (stored) {
            const user = JSON.parse(stored);
            setCurrentUser(user);
            // In a real app, patients would see providers, and providers see patients/admins
            // For now, we load all relevant contacts based on roles
            fetchContactList(user);
        }
    }, []);

    const fetchContactList = async (user: User) => {
        try {
            // This is a client-side call to a server function exposed via standard fetch in real app
            // For prototype, we simulate fetching users to chat with
            const res = await fetch('/api/users'); 
            const allUsers: User[] = await res.json();
            
            let filtered;
            if (user.role === 'user') {
                // Patients can chat with admins and navigators
                filtered = allUsers.filter(u => u.role === 'admin' || u.role === 'navigator');
            } else {
                // Providers see everyone except themselves
                filtered = allUsers.filter(u => u.id !== user.id);
            }
            setUsers(filtered);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (selectedUser && currentUser) {
            loadMessages();
            const interval = setInterval(loadMessages, 5000); // Polling for new messages
            return () => clearInterval(interval);
        }
    }, [selectedUser, currentUser]);

    const loadMessages = async () => {
        if (!selectedUser) return;
        try {
            const data = await fetchMessages(selectedUser.id);
            setMessages(data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser || isSending) return;

        setIsSubmitting(true);
        try {
            const sent = await sendMessage(selectedUser.id, newMessage);
            setMessages(prev => [...prev, sent]);
            setNewMessage('');
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to send message.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const filteredUsers = users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="h-[calc(100vh-140px)] max-h-[800px]">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-full">
                {/* Contacts Sidebar */}
                <Card className="md:col-span-1 flex flex-col h-full border-primary/10">
                    <CardHeader className="p-4 border-b">
                        <CardTitle className="text-lg flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary" />Messages</CardTitle>
                        <div className="relative mt-2">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search contacts..." 
                                className="pl-8 h-9 text-xs border-primary/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <ScrollArea className="flex-1">
                        <div className="p-2 space-y-1">
                            {isLoading ? (
                                <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map(user => (
                                    <button
                                        key={user.id}
                                        onClick={() => setSelectedUser(user)}
                                        className={cn(
                                            "w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left",
                                            selectedUser?.id === user.id ? "bg-primary text-primary-foreground shadow-md" : "hover:bg-muted text-foreground"
                                        )}
                                    >
                                        <Avatar className="h-10 w-10 border border-white/20">
                                            <AvatarImage src={user.avatarUrl} />
                                            <AvatarFallback className="bg-white/10">{user.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="font-semibold text-sm truncate">{user.name}</p>
                                            <p className={cn("text-xs truncate", selectedUser?.id === user.id ? "text-primary-foreground/70" : "text-muted-foreground")}>
                                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                            </p>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <p className="text-center text-xs text-muted-foreground py-8">No contacts found.</p>
                            )}
                        </div>
                    </ScrollArea>
                </Card>

                {/* Chat Window */}
                <Card className="md:col-span-3 flex flex-col h-full border-primary/10 shadow-lg">
                    {selectedUser ? (
                        <>
                            <CardHeader className="p-4 border-b flex flex-row items-center justify-between bg-muted/30">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10 border-2 border-primary/20">
                                        <AvatarImage src={selectedUser.avatarUrl} />
                                        <AvatarFallback>{selectedUser.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-base">{selectedUser.name}</CardTitle>
                                        <CardDescription className="text-xs uppercase tracking-widest text-primary font-bold">{selectedUser.role}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <ScrollArea className="flex-1 p-4 bg-muted/10">
                                <div className="space-y-4">
                                    {messages.map((msg, idx) => {
                                        const isMine = msg.sender_id === currentUser?.id;
                                        return (
                                            <div key={msg.id || idx} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                                                <div className={cn(
                                                    "max-w-[80%] p-3 rounded-2xl text-sm shadow-sm",
                                                    isMine 
                                                        ? "bg-primary text-primary-foreground rounded-tr-none" 
                                                        : "bg-card border text-foreground rounded-tl-none"
                                                )}>
                                                    <p>{msg.content}</p>
                                                    <p className={cn("text-[10px] mt-1 text-right opacity-70", isMine ? "text-primary-foreground" : "text-muted-foreground")}>
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div ref={scrollRef} />
                                </div>
                            </ScrollArea>
                            <div className="p-4 border-t bg-muted/20">
                                <form onSubmit={handleSend} className="flex gap-2">
                                    <Input 
                                        placeholder="Type your message..." 
                                        className="flex-1 border-primary/20 focus:border-primary bg-background"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        disabled={isSending}
                                    />
                                    <Button type="submit" disabled={!newMessage.trim() || isSending} className="bg-primary hover:bg-primary/90">
                                        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                    </Button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                                <MessageSquare className="h-8 w-8 text-primary/40" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground">Your Inbox</h3>
                            <p className="max-w-xs text-center text-sm mt-1">Select a contact from the list to start or continue a conversation.</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
