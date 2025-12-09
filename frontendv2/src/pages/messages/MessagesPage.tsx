import React from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Plus, Send, Inbox, Archive, Star } from 'lucide-react';

const messages = [
    { id: '1', from: 'Muhammad Ahmed', subject: 'Grade Submission Reminder', preview: 'Please submit grades for Mathematics...', date: '2024-12-09', read: false, starred: true },
    { id: '2', from: 'Ayesha Khan', subject: 'Parent Meeting Request', preview: 'A parent has requested a meeting...', date: '2024-12-08', read: true, starred: false },
    { id: '3', from: 'System Admin', subject: 'System Maintenance Notice', preview: 'Scheduled maintenance on Sunday...', date: '2024-12-07', read: true, starred: false },
];

export const MessagesPage: React.FC = () => {
    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Messages</h1>
                        <p className="text-muted-foreground mt-1">Internal messaging system</p>
                    </div>
                    <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        Compose
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1">
                        <Card>
                            <CardContent className="p-4">
                                <div className="space-y-2">
                                    <Button variant="default" className="w-full justify-start gap-2">
                                        <Inbox className="w-4 h-4" />
                                        Inbox
                                        <Badge variant="destructive" className="ml-auto">{messages.filter((m) => !m.read).length}</Badge>
                                    </Button>
                                    <Button variant="ghost" className="w-full justify-start gap-2">
                                        <Send className="w-4 h-4" />
                                        Sent
                                    </Button>
                                    <Button variant="ghost" className="w-full justify-start gap-2">
                                        <Star className="w-4 h-4" />
                                        Starred
                                    </Button>
                                    <Button variant="ghost" className="w-full justify-start gap-2">
                                        <Archive className="w-4 h-4" />
                                        Archive
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="lg:col-span-3">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Inbox</CardTitle>
                                    <Input placeholder="Search messages..." className="w-64" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`p-4 border rounded-lg hover:bg-muted/50 cursor-pointer ${!message.read ? 'bg-primary/5 border-primary/20' : ''
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        {message.starred && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                                                        <p className={`font-medium ${!message.read ? 'font-bold' : ''}`}>
                                                            {message.from}
                                                        </p>
                                                    </div>
                                                    <p className={`text-sm mt-1 ${!message.read ? 'font-semibold' : ''}`}>
                                                        {message.subject}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground mt-1">{message.preview}</p>
                                                </div>
                                                <div className="text-sm text-muted-foreground">{message.date}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};
