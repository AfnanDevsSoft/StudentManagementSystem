import React, { useState, useMemo } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { useAuth } from '../../contexts/AuthContext';
import { StudentProfileError } from '../../components/student/StudentProfileError';
import { studentService } from '../../services/student.service';
import { courseContentService } from '../../services/courseContent.service';
import {
    FileText,
    Video,
    Link as LinkIcon,
    Download,
    Search,
    FolderOpen,
    Loader2,
    AlertCircle
} from 'lucide-react';

export const StudentMaterialsPage: React.FC = () => {
    const { user } = useAuth();
    const studentId = user?.studentId;
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<string>('all');

    // 1. Fetch Student Enrollments
    const { data: enrollmentsData, isLoading: loadingEnrollments } = useQuery({
        queryKey: ['student-enrollments', studentId],
        queryFn: () => studentService.getEnrollments(studentId!),
        enabled: !!studentId,
    });

    const enrollments = Array.isArray(enrollmentsData?.data)
        ? enrollmentsData.data
        : (Array.isArray(enrollmentsData) ? enrollmentsData : []);

    const courseIds = enrollments.map((e: any) => e.course_id || e.id); // Handle different response shapes

    // 2. Fetch Materials for all courses
    const materialQueries = useQueries({
        queries: courseIds.map((courseId: string) => ({
            queryKey: ['course-content', courseId],
            queryFn: () => courseContentService.getByCourse(courseId),
            enabled: !!courseId,
        }))
    });

    const loadingMaterials = materialQueries.some(q => q.isLoading);

    // 3. Aggregate materials
    const materials = useMemo(() => {
        return materialQueries.flatMap(q => {
            const data = q.data;
            const contentList = Array.isArray((data as any)?.data) ? (data as any).data : (Array.isArray(data) ? data : []);
            return contentList.map((item: any) => {
                // Find course info
                const course = enrollments.find((e: any) => (e.course_id === item.course_id) || (e.id === item.course_id));
                return {
                    ...item,
                    courseName: course?.course?.course_name || course?.course_name || 'Unknown Course',
                    courseCode: course?.course?.course_code || course?.course_code || 'CODE'
                };
            });
        });
    }, [materialQueries, enrollments]);

    const filteredMaterials = materials.filter((material: any) => {
        const matchesSearch = (material.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
            (material.courseName?.toLowerCase() || '').includes(searchQuery.toLowerCase());
        const matchesType = selectedType === 'all' || material.type === selectedType;
        return matchesSearch && matchesType;
    });

    const getIcon = (type: string) => {
        switch (type) {
            case 'document':
            case 'pdf': return <FileText className="w-5 h-5 text-red-500" />;
            case 'video': return <Video className="w-5 h-5 text-blue-500" />;
            case 'link': return <LinkIcon className="w-5 h-5 text-green-500" />;
            default: return <FileText className="w-5 h-5" />;
        }
    };

    if (!studentId) {
        return <StudentProfileError />;
    }

    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Course Materials</h1>
                        <p className="text-muted-foreground mt-1">
                            Access lecture notes, recordings, and resources
                        </p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by title or course..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant={selectedType === 'all' ? 'default' : 'outline'}
                            onClick={() => setSelectedType('all')}
                            size="sm"
                        >
                            All
                        </Button>
                        <Button
                            variant={selectedType === 'document' ? 'default' : 'outline'}
                            onClick={() => setSelectedType('document')}
                            size="sm"
                        >
                            <FileText className="w-4 h-4 mr-2" />
                            Documents
                        </Button>
                        <Button
                            variant={selectedType === 'video' ? 'default' : 'outline'}
                            onClick={() => setSelectedType('video')}
                            size="sm"
                        >
                            <Video className="w-4 h-4 mr-2" />
                            Videos
                        </Button>
                        <Button
                            variant={selectedType === 'link' ? 'default' : 'outline'}
                            onClick={() => setSelectedType('link')}
                            size="sm"
                        >
                            <LinkIcon className="w-4 h-4 mr-2" />
                            Links
                        </Button>
                    </div>
                </div>

                {loadingEnrollments || loadingMaterials ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : filteredMaterials.length === 0 ? (
                    <div className="text-center py-12 border rounded-lg bg-muted/10">
                        <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">No materials found</h3>
                        <p className="text-muted-foreground">Try adjusting your search criteria</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredMaterials.map((material: any) => (
                            <Card key={material.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-muted rounded-full">
                                            {getIcon(material.type)}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-lg">{material.title}</h4>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                <Badge variant="outline" className="text-xs">
                                                    {material.courseCode}
                                                </Badge>
                                                <span>•</span>
                                                <span>{material.courseName}</span>
                                                <span>•</span>
                                                <span>{new Date(material.created_at || material.date).toLocaleDateString()}</span>
                                                {material.description && (
                                                    <>
                                                        <span>•</span>
                                                        <span className="truncate max-w-[200px]">{material.description}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" asChild>
                                        <a href={material.file_url || material.link_url} target="_blank" rel="noopener noreferrer">
                                            {material.type === 'link' ? <LinkIcon className="w-4 h-4 mr-2" /> : <Download className="w-4 h-4 mr-2" />}
                                            {material.type === 'link' ? 'Open Link' : 'Download'}
                                        </a>
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
};
