import React from 'react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Plus, Megaphone, Eye } from 'lucide-react';

const announcements = [
    { id: '1', title: 'Winter Break Schedule', content: 'Winter break will start from December 22nd...', author: 'System Admin', date: '2024-12-09', priority: 'high', views: 245 },
    { id: '2', title: 'New Library Books Available', content: 'Check out our new collection of science books...', author: 'Librarian', date: '2024-12-08', priority: 'normal', views: 156 },
    { id: '3', title: 'Sports Day Registration Open', content: 'Register for Annual Sports Day events...', author: 'Sports Coordinator', date: '2024-12-07', priority: 'normal', views: 189 },
];

export const AnnouncementsPage: React.FC = () => {
    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Announcements</h1>
                        <p className="text-muted-foreground mt-1">School-wide announcements and notices</p>
                    </div>
                    <Button className="gap-2">
                        <Plus className="w-4 h-4" />
                        Create Announcement
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Announcements</p>
                                    <h3 className="text-2xl font-bold mt-1">{announcements.length}</h3>
                                </div>
                                <Megaphone className="w-8 h-8 text-primary" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">High Priority</p>
                                    <h3 className="text-2xl font-bold mt-1">
                                        {announcements.filter((a) => a.priority === 'high').length}
                                    </h3>
                                </div>
                                <Megaphone className="w-8 h-8 text-red-500" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Views</p>
                                    <h3 className="text-2xl font-bold mt-1">
                                        {announcements.reduce((sum, a) => sum + a.views, 0)}
                                    </h3>
                                </div>
                                <Eye className="w-8 h-8 text-blue-500" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    {announcements.map((announcement) => (
                        <Card key={announcement.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <CardTitle className="text-xl">{announcement.title}</CardTitle>
                                            <Badge variant={announcement.priority === 'high' ? 'destructive' : 'outline'}>
                                                {announcement.priority}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            By {announcement.author} • {announcement.date}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Eye className="w-4 h-4" />
                                            {announcement.views}
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-4">{announcement.content}</p>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm">Read More</Button>
                                    <Button variant="ghost" size="sm">Edit</Button>
                                    <Button variant="ghost" size="sm">Delete</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </MainLayout>
    );
};
