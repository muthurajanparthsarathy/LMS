"use client"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { PlusIcon, Search, BookOpen, Clock, Users, Eye, Edit, Copy, Trash2, CheckCircle, XCircle, Loader2, X, ImageIcon, BadgeCheck, BookOpenText, Layers, LayoutDashboard, Shapes, ListChecks, ChevronRight, Mail, Phone, User, FileText, Activity, MapPin, Briefcase, Building2, LayersIcon, FolderIcon, LayoutGridIcon, UserCheck } from "lucide-react";
import { Input } from "@/components/ui/input";

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useState, useEffect } from "react";

import { UserTable } from '@/components/ui/alterationTable';
import { courseStructureApi } from "@/apiServices/createCourseStucture";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import DashboardLayoutProgramcoordinator from "../../components/layout";
import AddCourseSettingsPopup from "@/app/admin/component/addcoursestructurepopup";

type CourseStructure = {
    _id: string;
    clientName: string;
    clientData: {
        clientCompany: string;
        clientAddress: string;
        contactPersons: Array<{
            name: string;
            email: string;
            phoneNumber: string;
            isPrimary: boolean;
        }>;
        description: string;
        status: string;
    };
    serviceType: string;
    serviceModal: string;
    category: string;
    courseCode: string;
    courseName: string;
    courseDescription: string;
    courseDuration: string;
    courseLevel: string;
    updatedAt: string;
    resourcesType: string[];
    courseHierarchy: string[];
    I_Do: string[];
    We_Do: string[];
    You_Do: string[];
    courseImage?: string;
    status: 'Published' | 'Draft' | 'Unpublished';
};

export default function CourseStructurePage() {
    const queryClient = useQueryClient()
    const router = useRouter();
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState<'date' | 'courseName' | 'clientName' | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

    const [selectedCourse, setSelectedCourse] = useState<CourseStructure | null>(null);
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [selectedHierarchy, setSelectedHierarchy] = useState<any>(null);
    const [selectedPedagogy, setSelectedPedagogy] = useState<any>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState<CourseStructure | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [courseToEdit, setCourseToEdit] = useState<string | null>(null);

    const formatDate = (d: string): string => new Date(d).toLocaleDateString('en-IN');

    // Handle sort
    const handleSort = (field: 'date' | 'courseName' | 'clientName') => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Get sort icon
    const getSortIcon = (field: 'date' | 'courseName' | 'clientName') => {
        if (sortField !== field) {
            return <ArrowUpDown className="h-3 w-3 ml-1" />;
        }
        return sortDirection === 'asc' ? <ArrowUp className="h-3 w-3 ml-1" /> : <ArrowDown className="h-3 w-3 ml-1" />;
    };

    const goToPedagogyPage = (courseId: string) => {
        const courseIdToPass = courseId;

        // Pass course data via query string
        const query = new URLSearchParams({
            courseId: courseIdToPass ?? '',
        }).toString();

        router.push(`/programcoordinator/pages/pedagogy2?${query}`);
    };

    const { data: courseStructures = [], isLoading, error } = useQuery(courseStructureApi.getAll());
    const deleteMutation = useMutation({
        mutationFn: (courseId: string) => courseStructureApi.delete(courseId).mutationFn(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courseStructures'] });
            setShowDeleteModal(false);
            setCourseToDelete(null);
        },
        onError: (error: Error) => {
            console.error('Delete failed:', error);
            alert('Failed to delete course structure');
        }
    });
    
    // Filter structures based on search term
    let filteredStructures = courseStructures.filter((structure: { courseName: string; courseCode: string; clientData: { clientCompany: string; }; }) =>
        structure.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        structure.courseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        structure.clientData?.clientCompany.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Apply sorting
    if (sortField) {
        filteredStructures = [...filteredStructures].sort((a: any, b: any) => {
            let aValue, bValue;

            switch (sortField) {
                case 'date':
                    aValue = new Date(a.updatedAt).getTime();
                    bValue = new Date(b.updatedAt).getTime();
                    break;
                case 'courseName':
                    aValue = a.courseName.toLowerCase();
                    bValue = b.courseName.toLowerCase();
                    break;
                case 'clientName':
                    aValue = (a.clientData?.clientCompany || a.clientName).toLowerCase();
                    bValue = (b.clientData?.clientCompany || b.clientName).toLowerCase();
                    break;
                default:
                    return 0;
            }

            if (sortDirection === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    } else {
        // Default sort by date (newest first)
        filteredStructures = filteredStructures.sort((a: any, b: any) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    }

    // Table columns configuration
    const columns = [
        {
            key: 'courseDate',
            label: (
                <div className="flex items-center cursor-pointer" onClick={() => handleSort('date')}>
                    Date
                    {getSortIcon('date')}
                </div>
            ),
            width: '15%',
            align: 'left' as const,
            renderCell: (structure: CourseStructure) => (
                <div className="text-xs font-medium text-gray-900">
                    {formatDate(structure.updatedAt)}
                </div>
            )
        },
        {
            key: 'clientName',
            label: (
                <div className="flex items-center cursor-pointer" onClick={() => handleSort('clientName')}>
                    Client Name
                    {getSortIcon('clientName')}
                </div>
            ),
            width: '15%',
            align: 'left' as const,
            renderCell: (structure: CourseStructure) => (
                <button
                    onClick={() => setSelectedClient(structure.clientData)}
                  className="flex items-center cursor-pointer justify-between gap-2 px-2.5 py-1.5 text-xs font-medium text-blue-600 rounded-md border border-blue-200 hover:bg-blue-50 hover:text-blue-800 transition-colors"
                >
                    <Eye className="h-3.5 w-3.5" />
                    <span>{structure.clientData?.clientCompany || structure.clientName}</span>
                </button>
            )
        },
        {
            key: 'courseName',
            label: (
                <div className="flex items-center cursor-pointer" onClick={() => handleSort('courseName')}>
                    Course Name
                    {getSortIcon('courseName')}
                </div>
            ),
            width: '20%',
            align: 'left' as const,
            renderCell: (structure: CourseStructure) => (
                <button
                    onClick={() => setSelectedCourse(structure)}
                    className="flex items-center cursor-pointer justify-between gap-2 px-2.5 py-1.5 text-xs font-medium text-blue-600 rounded-md border border-blue-200 hover:bg-blue-50 hover:text-blue-800 transition-colors"
                >
                    <Eye className="h-3.5 w-3.5" />
                    <span>{structure.courseName}</span>
                </button>
            )
        },
        {
            key: 'courseHierarchy',
            label: 'Course Hierarchy',
            width: '15%',
            align: 'left' as const,
            renderCell: (structure: CourseStructure) => (
                <button
                    onClick={() => setSelectedHierarchy({
                        resourcesType: structure.resourcesType,
                        courseHierarchy: structure.courseHierarchy
                    })}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 cursor-pointer rounded-md bg-gray-50 hover:bg-gray-200 transition-colors"
                >
                    <LayersIcon className="h-3.5 w-3.5 text-gray-600" />
                    <span className="text-xs font-medium text-gray-700">View</span>
                    <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                </button>
            )
        },
        {
            key: 'pedagogy',
            label: 'Pedagogy',
            width: '15%',
            align: 'left' as const,
            renderCell: (structure: CourseStructure) => (
                <button
                    onClick={() => setSelectedPedagogy({
                        I_Do: structure.I_Do,
                        We_Do: structure.We_Do,
                        You_Do: structure.You_Do
                    })}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md cursor-pointer bg-purple-50 hover:bg-purple-200 transition-colors"
                >
                    <Users className="h-3.5 w-3.5 text-purple-600" />
                    <span className="text-xs font-medium text-purple-700">View</span>
                    <ChevronRight className="h-3.5 w-3.5 text-purple-400" />
                </button>
            )
        },
        {
            key: 'pedagogyBuilder',
            label: 'Pedagogy Add',
            width: '11%',
            align: 'left' as const,
            renderCell: (structure: CourseStructure) => (
                <button
                    onClick={() => goToPedagogyPage(structure._id)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md cursor-pointer bg-green-50 hover:bg-green-100 transition-colors w-full"
                >
                    <ListChecks className="h-3.5 w-3.5 text-green-600" />
                    <span className="text-xs font-medium text-green-700">Add Pedagogy</span>
                    <ChevronRight className="h-3.5 w-3.5 text-green-400" />
                </button>
            ),
            sortable: false
        }
    ];

    const confirmDelete = async () => {
        if (!courseToDelete) return;
        deleteMutation.mutate(courseToDelete._id);
    };

    // Action buttons configuration
    const actionButtons = {
        view: (structure: CourseStructure) => {
            setSelectedCourse(structure);
        },
        edit: (structure: CourseStructure) => {
            setCourseToEdit(structure?._id);
            setIsPopupOpen(true);
        },
        delete: (structure: CourseStructure) => {
            setCourseToDelete(structure);
            setShowDeleteModal(true);
        }
    };

    const itemsPerPage = 5;
    const paginatedData = filteredStructures.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const popupVariants = {
        hidden: {
            opacity: 0,
            y: 20,
            transition: { duration: 0.1 }
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3, ease: "easeOut" }
        },
        exit: {
            opacity: 0,
            y: -20,
            transition: { duration: 0.1 }
        }
    } as const

    return (
        <DashboardLayoutProgramcoordinator>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="p-1 "
            >
                <div className="p-1">
                    {/* Error message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                            {error.message}
                        </div>
                    )}

                    {/* Breadcrumbs */}
                    <div className="mb-2">
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/admin/pages/admindashboard" className="text-xs sm:text-sm text-gray-600 hover:text-indigo-600">
                                        Dashboard
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="text-gray-400" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-xs sm:text-sm font-medium text-indigo-600">Course Structures</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>

                    {/* Statistics Cards */}
                    <div className=" py-2 border-gray-200">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-1">
                            {/* Total Clients */}
                            <div className="bg-none border border-gray-300 rounded-lg  p-2">
                                <div className="flex items-center space-x-3">
                                    <div className="rounded-md p-2 bg-gray-100 text-gray-700">
                                        <Users className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="text-gray-900 text-xs font-semibold" >
                                            {!isLoading ? (
                                                <span className=" pr-1 font-bold text-blue-700" style={{ fontSize: "14px" }}>
                                                    {courseStructures.length}
                                                </span>
                                            ) : (
                                                <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                                            )}
                                            <span className="text-xs text-gray-600 font-medium">Total Course</span>
                                        </div>
                                        <div className="text-gray-500" style={{ fontSize: "10px" }}>All current Course</div>
                                    </div>
                                </div>
                            </div>

                            {/* Active Clients */}
                            <div className="bg-none border border-gray-300 rounded-lg  p-2">
                                <div className="flex items-center space-x-3">
                                    <div className="rounded-md p-2 bg-green-100 text-green-700">
                                        <CheckCircle className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="text-gray-900 text-xs font-semibold" >
                                            {!isLoading ? (
                                                <span className=" pr-1 font-bold text-green-700" style={{ fontSize: "14px" }}>
                                                    3
                                                </span>
                                            ) : (
                                                <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                                            )}
                                            <span className="text-xs text-gray-600 font-medium">Active Course</span>
                                        </div>
                                        <div className="text-gray-500" style={{ fontSize: "10px" }}>Currently active Course</div>
                                    </div>
                                </div>
                            </div>

                            {/* Inactive Clients */}
                            <div className="bg-none border border-gray-300 rounded-lg  p-2">
                                <div className="flex items-center space-x-3">
                                    <div className="rounded-md p-2 bg-red-100 text-red-700">
                                        <XCircle className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="text-gray-900 text-xs font-semibold" >
                                            {!isLoading ? (
                                                <span className=" pr-1 font-bold text-red-700" style={{ fontSize: "14px" }}>
                                                    1
                                                </span>
                                            ) : (
                                                <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                                            )}
                                            <span className="text-xs text-gray-600 font-medium">Inactive Course</span>
                                        </div>
                                        <div className="text-gray-500" style={{ fontSize: "10px" }}>Inactive Course</div>
                                    </div>
                                </div>
                            </div>

                            {/* Client Data */}
                            <div className="bg-none border border-gray-300 rounded-lg  p-2">
                                <div className="flex items-center space-x-3">
                                    <div className="rounded-md p-2 bg-purple-100 text-purple-700">
                                        <Clock className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="text-gray-900 text-xs font-semibold" >
                                            {!isLoading ? (
                                                <span className=" pr-1 font-bold text-purple-700" style={{ fontSize: "14px" }}>
                                                    4
                                                </span>
                                            ) : (
                                                <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                                            )}
                                            <span className="text-xs text-gray-600 font-medium">Recent Course</span>
                                        </div>
                                        <div className="text-gray-500" style={{ fontSize: "10px" }}>Recently added Course</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and New Button Row */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
                        {/* Search Input */}
                        <div className="w-full sm:flex-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                            <Input
                                type="text"
                                placeholder="Search course structures..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-8 pl-9 text-sm w-full"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                </button>
                            )}
                        </div>

                        {/* New Structure Button */}
                        <div className="w-full sm:w-auto">
                            <Button
                                onClick={() => {
                                    setCourseToEdit(null); // Clear any edit state
                                    setIsPopupOpen(true);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 h-auto w-full sm:w-auto"
                            >
                                <PlusIcon className="h-4 w-4 mr-1.5" />
                                <span className="whitespace-nowrap">New Structure</span>
                            </Button>
                        </div>
                    </div>

                    {/* Course Structures Table */}
                    <div className="rounded-lg overflow-hidden">
                        <UserTable
                            users={paginatedData}
                            isLoading={isLoading}
                            columns={columns}
                            actionButtons={actionButtons}
                            pagination={{
                                currentPage: currentPage,
                                totalPages: Math.ceil(filteredStructures.length / itemsPerPage),
                                totalItems: filteredStructures.length,
                                itemsPerPage: itemsPerPage,
                                onPageChange: (page) => setCurrentPage(page),
                            }}
                        />
                    </div>

                    {/* Add Course Structure Popup */}
                    <AddCourseSettingsPopup
                        isOpen={isPopupOpen}
                        onClose={() => {
                            setIsPopupOpen(false);
                            setCourseToEdit(null); // Reset edit state when closing
                        }}
                        courseId={courseToEdit || undefined}
                        totalCourses={courseStructures.length} // Pass the length here
                    />

                    {/* Course Details Popup */}
                    <AnimatePresence>
                        {selectedCourse && (
                            <Dialog open={!!selectedCourse} onOpenChange={() => setSelectedCourse(null)}>
                                <DialogContent className="sm:max-w-2xl w-full max-h-[93vh] overflow-hidden p-0">
                                    <motion.div
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        variants={popupVariants}
                                    >
                                        <DialogHeader className="px-4 py-3 border-b border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <DialogTitle className="text-base font-semibold text-gray-900 flex items-center gap-2">
                                                    <BookOpenText className="w-4 h-4 text-blue-600" />
                                                    Course Details
                                                </DialogTitle>
                                                <button
                                                    onClick={() => setSelectedCourse(null)}
                                                    className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                                                >
                                                    <X className="w-4 h-4 text-gray-500" />
                                                </button>
                                            </div>
                                        </DialogHeader>

                                        {selectedCourse && (
                                            <div className="px-3 py-1 overflow-y-auto">
                                                <div className="space-y-2">
                                                    {/* Main Course Info */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {/* Left Column */}
                                                        <div className="space-y-2">
                                                            <div className="bg-white p-3 rounded-md border border-gray-200">
                                                                <label className="block text-xs text-gray-500 mb-1">Course Code</label>
                                                                <div className="flex items-center gap-2">
                                                                    <ListChecks className="w-4 h-4 text-blue-600" />
                                                                    <span className="text-sm text-gray-900">{selectedCourse.courseCode}</span>
                                                                </div>
                                                            </div>

                                                            <div className="bg-white p-3 rounded-md border border-gray-200">
                                                                <label className="block text-xs text-gray-500 mb-1">Course Name</label>
                                                                <div className="flex items-center gap-2">
                                                                    <BookOpenText className="w-4 h-4 text-blue-600" />
                                                                    <span className="text-sm text-gray-900">{selectedCourse.courseName}</span>
                                                                </div>
                                                            </div>

                                                            <div className="bg-white p-3 rounded-md border border-gray-200">
                                                                <label className="block text-xs text-gray-500 mb-1">Category</label>
                                                                <div className="flex items-center gap-2">
                                                                    <Shapes className="w-4 h-4 text-blue-600" />
                                                                    <span className="text-sm text-gray-900">{selectedCourse.category}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Right Column */}
                                                        <div className="space-y-2">
                                                            <div className="bg-white p-3 rounded-md border border-gray-200">
                                                                <label className="block text-xs text-gray-500 mb-1">Service Type</label>
                                                                <div className="flex items-center gap-2">
                                                                    <LayoutDashboard className="w-4 h-4 text-blue-600" />
                                                                    <span className="text-sm text-gray-900">{selectedCourse.serviceType}</span>
                                                                </div>
                                                            </div>

                                                            <div className="bg-white p-3 rounded-md border border-gray-200">
                                                                <label className="block text-xs text-gray-500 mb-1">Service Model</label>
                                                                <div className="flex items-center gap-2">
                                                                    <Layers className="w-4 h-4 text-blue-600" />
                                                                    <span className="text-sm text-gray-900">{selectedCourse.serviceModal}</span>
                                                                </div>
                                                            </div>

                                                            <div className="bg-white p-3 rounded-md border border-gray-200">
                                                                <label className="block text-xs text-gray-500 mb-1">Course Level</label>
                                                                <div className="flex items-center gap-2">
                                                                    <BadgeCheck className="w-4 h-4 text-blue-600" />
                                                                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${selectedCourse.courseLevel?.toLowerCase() === 'beginner'
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : selectedCourse.courseLevel?.toLowerCase() === 'intermediate'
                                                                            ? 'bg-amber-100 text-amber-800'
                                                                            : 'bg-purple-100 text-purple-800'
                                                                        }`}>
                                                                        {selectedCourse.courseLevel}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* New layout for Duration, Description and Image */}
                                                    <div className={`grid ${selectedCourse.courseImage ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'} gap-3`}>
                                                        {/* Left side - Duration and Description */}
                                                        <div className={`${selectedCourse.courseImage ? 'lg:col-span-2' : ''} space-y-3`}>
                                                            {/* Duration */}
                                                            <div className="bg-white p-3 rounded-md border border-gray-200">
                                                                <label className="block text-xs text-gray-500 mb-1">Duration</label>
                                                                <div className="flex items-center gap-2">
                                                                    <Clock className="w-4 h-4 text-blue-600" />
                                                                    <span className="text-sm text-gray-900">{selectedCourse.courseDuration} mins</span>
                                                                </div>
                                                            </div>

                                                            {/* Description */}
                                                            <div className="bg-gray-50 p-3 rounded-md border border-gray-200 max-h-[90vh]">
                                                                <label className="block text-xs text-gray-500 mb-1">Description</label>
                                                                <p className="text-sm text-gray-700 leading-snug whitespace-pre-line">
                                                                    {selectedCourse.courseDescription}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Right side - Image */}
                                                        {selectedCourse.courseImage && (
                                                            <div className="lg:col-span-1">
                                                                <div className="bg-white p-3 rounded-md border border-gray-200 h-full flex flex-col">
                                                                    <label className="block text-xs font-medium text-gray-500 mb-1">Course Thumbnail</label>
                                                                    <div className="aspect-square w-full rounded-md border border-gray-200 overflow-hidden shadow-xs">
                                                                        <img
                                                                            src={selectedCourse.courseImage}
                                                                            alt="Course thumbnail"
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    </div>
                                                                    <div className="mt-2 flex justify-end">
                                                                        <div className="bg-white rounded-full p-0.5 shadow-xs border border-gray-100">
                                                                            <ImageIcon className="w-3 h-3 text-gray-400" />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                </DialogContent>
                            </Dialog>
                        )}
                    </AnimatePresence>

                    {/* Client Details Popup */}
                    <AnimatePresence>
                        {selectedClient && (
                            <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
                                <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-2xl lg:max-w-4xl max-h-[90dvh] overflow-y-auto rounded-lg mx-2">
                                    <motion.div
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        variants={popupVariants}
                                    >
                                        <DialogHeader className="pb-2 border-b">
                                            <div className="flex items-center space-x-2">
                                                <Building2 className="h-4 w-4 text-blue-600" />
                                                <DialogTitle className="text-sm sm:text-md font-semibold text-gray-800">Client Details</DialogTitle>
                                            </div>
                                        </DialogHeader>

                                        {selectedClient && (
                                            <div className="space-y-3 py-1">
                                                {/* Client Overview Card */}
                                                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border">
                                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
                                                        <div className="space-y-0.5">
                                                            <div className="flex items-center text-xs text-gray-500">
                                                                <Briefcase className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                                                                Company Name
                                                            </div>
                                                            <p className="text-sm font-medium text-gray-800 pl-5 break-words">
                                                                {selectedClient.clientCompany}
                                                            </p>
                                                        </div>

                                                        <div className="space-y-0.5">
                                                            <div className="flex items-center text-xs text-gray-500">
                                                                <MapPin className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                                                                Address
                                                            </div>
                                                            <p className="text-sm text-gray-700 pl-5 break-words">{selectedClient.clientAddress}</p>
                                                        </div>

                                                        <div className="space-y-0.5">
                                                            <div className="flex items-center text-xs text-gray-500">
                                                                <Activity className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                                                                Status
                                                            </div>
                                                            <div className="pl-5">
                                                                <Badge
                                                                    variant={selectedClient.status === 'active' ? 'default' : 'outline'}
                                                                    className={`text-xs ${selectedClient.status === 'active' ? 'bg-green-50 text-green-700 hover:bg-green-50' : 'bg-gray-50 text-gray-600 hover:bg-gray-50'}`}
                                                                >
                                                                    {selectedClient.status === 'active' ? (
                                                                        <CheckCircle className="h-3 w-3 mr-1" />
                                                                    ) : (
                                                                        <Clock className="h-3 w-3 mr-1" />
                                                                    )}
                                                                    {selectedClient.status.charAt(0).toUpperCase() + selectedClient.status.slice(1)}
                                                                </Badge>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-0.5">
                                                            <div className="flex items-center text-xs text-gray-500">
                                                                <FileText className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                                                                Description
                                                            </div>
                                                            <p className="text-sm text-gray-700 pl-5 break-words line-clamp-3">
                                                                {selectedClient.description || "-"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Contact Persons Section */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h3 className="flex items-center text-sm font-medium text-gray-800">
                                                            <Users className="h-4 w-4 mr-1.5 text-blue-600" />
                                                            Contact Persons
                                                        </h3>
                                                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                                                            {selectedClient.contactPersons.length}
                                                        </span>
                                                    </div>

                                                    {/* Mobile Card View - Hidden on desktop */}
                                                    <div className="block md:hidden space-y-2">
                                                        {selectedClient.contactPersons.map((person: any, index: number) => (
                                                            <div key={index} className="bg-white border rounded-lg p-3 shadow-sm">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <div className="flex items-center">
                                                                        <User className="h-4 w-4 mr-2 text-gray-500" />
                                                                        <span className="font-medium text-sm text-gray-800">{person.name}</span>
                                                                    </div>
                                                                    {person.isPrimary && (
                                                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                                                    )}
                                                                </div>

                                                                <div className="space-y-1">
                                                                    <a
                                                                        href={`mailto:${person.email}`}
                                                                        className="flex items-center text-sm text-gray-600 hover:text-blue-600 hover:underline"
                                                                    >
                                                                        <Mail className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                                                                        <span className="break-all">{person.email}</span>
                                                                    </a>

                                                                    <a
                                                                        href={`tel:${person.phoneNumber}`}
                                                                        className="flex items-center text-sm text-gray-600 hover:text-blue-600 hover:underline"
                                                                    >
                                                                        <Phone className="h-3.5 w-3.5 mr-2 flex-shrink-0" />
                                                                        <span>{person.phoneNumber}</span>
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Desktop Table View - Hidden on mobile */}
                                                    <div className="hidden md:block border rounded-lg overflow-hidden">
                                                        <div className="overflow-x-auto">
                                                            <Table className="min-w-full">
                                                                <TableHeader className="bg-gray-50">
                                                                    <TableRow className="h-8">
                                                                        <TableHead className="text-xs font-medium text-gray-600 px-2 sm:px-3 py-1.5 min-w-[120px]">Name</TableHead>
                                                                        <TableHead className="text-xs font-medium text-gray-600 px-2 sm:px-3 py-1.5 min-w-[180px]">Email</TableHead>
                                                                        <TableHead className="text-xs font-medium text-gray-600 px-2 sm:px-3 py-1.5 min-w-[120px]">Phone</TableHead>
                                                                        <TableHead className="text-xs font-medium text-gray-600 px-2 sm:px-3 py-1.5 text-center w-[80px]">Primary</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {selectedClient.contactPersons.map((person: any, index: number) => (
                                                                        <TableRow key={index} className="h-auto hover:bg-gray-50">
                                                                            <TableCell className="text-sm text-gray-800 px-2 sm:px-3 py-2 font-medium">
                                                                                <div className="flex items-center min-w-0">
                                                                                    <User className="h-3.5 w-3.5 mr-1.5 text-gray-500 flex-shrink-0" />
                                                                                    <span className="truncate">{person.name}</span>
                                                                                </div>
                                                                            </TableCell>
                                                                            <TableCell className="text-sm text-gray-700 px-2 sm:px-3 py-2">
                                                                                <a
                                                                                    href={`mailto:${person.email}`}
                                                                                    className="hover:text-blue-600 hover:underline flex items-center min-w-0"
                                                                                >
                                                                                    <Mail className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                                                                                    <span className="truncate">{person.email}</span>
                                                                                </a>
                                                                            </TableCell>
                                                                            <TableCell className="text-sm text-gray-700 px-2 sm:px-3 py-2">
                                                                                <a
                                                                                    href={`tel:${person.phoneNumber}`}
                                                                                    className="hover:text-blue-600 hover:underline flex items-center min-w-0"
                                                                                >
                                                                                    <Phone className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                                                                                    <span className="truncate">{person.phoneNumber}</span>
                                                                                </a>
                                                                            </TableCell>
                                                                            <TableCell className="px-2 sm:px-3 py-2 text-center">
                                                                                {person.isPrimary ? (
                                                                                    <CheckCircle className="h-4 w-4 text-green-500 inline-block" />
                                                                                ) : (
                                                                                    <span className="text-gray-300">-</span>
                                                                                )}
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        </div>
                                                    </div>

                                                    {/* Tablet Horizontal Scroll Table - Visible only on tablet */}
                                                    <div className="hidden sm:block md:hidden border rounded-lg overflow-hidden">
                                                        <div className="overflow-x-auto">
                                                            <div className="min-w-[600px]">
                                                                <Table>
                                                                    <TableHeader className="bg-gray-50">
                                                                        <TableRow className="h-8">
                                                                            <TableHead className="text-xs font-medium text-gray-600 px-3 py-1.5 w-[140px]">Name</TableHead>
                                                                            <TableHead className="text-xs font-medium text-gray-600 px-3 py-1.5 w-[200px]">Email</TableHead>
                                                                            <TableHead className="text-xs font-medium text-gray-600 px-3 py-1.5 w-[140px]">Phone</TableHead>
                                                                            <TableHead className="text-xs font-medium text-gray-600 px-3 py-1.5 text-center w-[80px]">Primary</TableHead>
                                                                        </TableRow>
                                                                    </TableHeader>
                                                                    <TableBody>
                                                                        {selectedClient.contactPersons.map((person: any, index: number) => (
                                                                            <TableRow key={index} className="h-auto hover:bg-gray-50">
                                                                                <TableCell className="text-sm text-gray-800 px-3 py-2 font-medium">
                                                                                    <div className="flex items-center">
                                                                                        <User className="h-3.5 w-3.5 mr-1.5 text-gray-500 flex-shrink-0" />
                                                                                        <span className="truncate">{person.name}</span>
                                                                                    </div>
                                                                                </TableCell>
                                                                                <TableCell className="text-sm text-gray-700 px-3 py-2">
                                                                                    <a
                                                                                        href={`mailto:${person.email}`}
                                                                                        className="hover:text-blue-600 hover:underline flex items-center"
                                                                                    >
                                                                                        <Mail className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                                                                                        <span className="truncate">{person.email}</span>
                                                                                    </a>
                                                                                </TableCell>
                                                                                <TableCell className="text-sm text-gray-700 px-3 py-2">
                                                                                    <a
                                                                                        href={`tel:${person.phoneNumber}`}
                                                                                        className="hover:text-blue-600 hover:underline flex items-center"
                                                                                    >
                                                                                        <Phone className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                                                                                        <span className="truncate">{person.phoneNumber}</span>
                                                                                    </a>
                                                                                </TableCell>
                                                                                <TableCell className="px-3 py-2 text-center">
                                                                                    {person.isPrimary ? (
                                                                                        <CheckCircle className="h-4 w-4 text-green-500 inline-block" />
                                                                                    ) : (
                                                                                        <span className="text-gray-300">-</span>
                                                                                    )}
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        ))}
                                                                    </TableBody>
                                                                </Table>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                </DialogContent>
                            </Dialog>
                        )}
                    </AnimatePresence>

                    {/* Hierarchy Details Popup */}
                    <AnimatePresence>
                        {selectedHierarchy && (
                            <Dialog open={!!selectedHierarchy} onOpenChange={() => setSelectedHierarchy(null)}>
                                <DialogContent className="sm:max-w-md w-[calc(100%-2rem)] mx-auto rounded-xl border bg-white shadow-xl p-0 overflow-hidden">
                                    <motion.div
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        variants={popupVariants}
                                    >
                                        <DialogHeader className="border-b p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600">
                                                    <LayoutGridIcon className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <DialogTitle className="text-md font-semibold text-gray-900">
                                                        Course Structure Details
                                                    </DialogTitle>

                                                </div>
                                            </div>
                                        </DialogHeader>

                                        {selectedHierarchy && (
                                            <div className="space-y-6 p-6">
                                                {/* Resource Types Section */}
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-1.5 rounded-md bg-amber-100 text-amber-600">
                                                            <FolderIcon className="w-4 h-4" />
                                                        </div>
                                                        <h4 className="text-sm font-semibold text-gray-700">
                                                            Resource Types
                                                        </h4>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {Array.isArray(selectedHierarchy.resourcesType) ? (
                                                            selectedHierarchy.resourcesType.map((type: string, index: number) => (
                                                                <span
                                                                    key={index}
                                                                    className="text-xs px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1"
                                                                >
                                                                    <FolderIcon className="w-3 h-3" />
                                                                    {type}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                                                                <FolderIcon className="w-3 h-3" />
                                                                {selectedHierarchy.resourcesType}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Course Hierarchy Section */}
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-1.5 rounded-md bg-indigo-100 text-indigo-600">
                                                            <LayersIcon className="w-4 h-4" />
                                                        </div>
                                                        <h4 className="text-sm font-semibold text-gray-700">
                                                            Course Levels
                                                        </h4>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {Array.isArray(selectedHierarchy.courseHierarchy) ? (
                                                            selectedHierarchy.courseHierarchy.map((hierarchy: string, index: number) => (
                                                                <span
                                                                    key={index}
                                                                    className="text-xs px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-1"
                                                                >
                                                                    <LayersIcon className="w-3 h-3" />
                                                                    {hierarchy}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                                                                <LayersIcon className="w-3 h-3" />
                                                                {selectedHierarchy.courseHierarchy}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                            </div>
                                        )}
                                    </motion.div>
                                </DialogContent>
                            </Dialog>
                        )}
                    </AnimatePresence>

                    {/* Pedagogy Details Popup */}
                    <AnimatePresence>
                        {selectedPedagogy && (
                            <Dialog open={!!selectedPedagogy} onOpenChange={() => setSelectedPedagogy(null)}>
                                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                                    <motion.div
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        variants={popupVariants}
                                    >
                                        <DialogHeader className="border-b pb-2">
                                            <DialogTitle className="flex items-center gap-2 text-md font-semibold text-gray-800">
                                                <BookOpen className="w-5 h-5 text-indigo-600" />
                                                Pedagogy Details
                                            </DialogTitle>

                                        </DialogHeader>

                                        {selectedPedagogy && (
                                            <div className="grid gap-6 py-4">
                                                {/* I Do Section */}
                                                <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <User className="w-4 h-4 text-indigo-600" />
                                                        <h4 className="text-sm font-semibold text-indigo-700">I Do (Instructor Led)</h4>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {Array.isArray(selectedPedagogy.I_Do) ? (
                                                            selectedPedagogy.I_Do.length > 0 ? (
                                                                selectedPedagogy.I_Do.map((item: string, index: number) => (
                                                                    <Badge
                                                                        key={index}
                                                                        variant="outline"
                                                                        className="text-xs bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50 px-3 py-1"
                                                                    >
                                                                        {item}
                                                                    </Badge>
                                                                ))
                                                            ) : (
                                                                <p className="text-xs text-gray-500 italic">No instructor-led activities</p>
                                                            )
                                                        ) : (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50 px-3 py-1"
                                                            >
                                                                {selectedPedagogy.I_Do}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* We Do Section */}
                                                <div className="p-4 bg-teal-50 rounded-lg border border-teal-100">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <Users className="w-4 h-4 text-teal-600" />
                                                        <h4 className="text-sm font-semibold text-teal-700">We Do (Collaborative)</h4>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {Array.isArray(selectedPedagogy.We_Do) ? (
                                                            selectedPedagogy.We_Do.length > 0 ? (
                                                                selectedPedagogy.We_Do.map((item: string, index: number) => (
                                                                    <Badge
                                                                        key={index}
                                                                        variant="outline"
                                                                        className="text-xs bg-white text-teal-700 border-teal-200 hover:bg-teal-50 px-3 py-1"
                                                                    >
                                                                        {item}
                                                                    </Badge>
                                                                ))
                                                            ) : (
                                                                <p className="text-xs text-gray-500 italic">No collaborative activities</p>
                                                            )
                                                        ) : (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs bg-white text-teal-700 border-teal-200 hover:bg-teal-50 px-3 py-1"
                                                            >
                                                                {selectedPedagogy.We_Do}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* You Do Section */}
                                                <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <UserCheck className="w-4 h-4 text-amber-600" />
                                                        <h4 className="text-sm font-semibold text-amber-700">You Do (Independent)</h4>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {Array.isArray(selectedPedagogy.You_Do) ? (
                                                            selectedPedagogy.You_Do.length > 0 ? (
                                                                selectedPedagogy.You_Do.map((item: string, index: number) => (
                                                                    <Badge
                                                                        key={index}
                                                                        variant="outline"
                                                                        className="text-xs bg-white text-amber-700 border-amber-200 hover:bg-amber-50 px-3 py-1"
                                                                    >
                                                                        {item}
                                                                    </Badge>
                                                                ))
                                                            ) : (
                                                                <p className="text-xs text-gray-500 italic">No independent activities</p>
                                                            )
                                                        ) : (
                                                            <Badge
                                                                variant="outline"
                                                                className="text-xs bg-white text-amber-700 border-amber-200 hover:bg-amber-50 px-3 py-1"
                                                            >
                                                                {selectedPedagogy.You_Do}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>

                                            </div>
                                        )}
                                    </motion.div>
                                </DialogContent>
                            </Dialog>
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {showDeleteModal && (
                            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                                <DialogContent className="max-w-md">
                                    <motion.div
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        variants={popupVariants}
                                    >
                                        <DialogHeader>
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-red-100 rounded-full">
                                                    <Trash2 className="h-5 w-5 text-red-600" />
                                                </div>
                                                <div>
                                                    <DialogTitle className="text-lg font-semibold text-gray-900">Confirm Deletion</DialogTitle>
                                                    <DialogDescription className="text-sm text-gray-600">
                                                        Are you sure you want to delete this course structure? This action cannot be undone.
                                                    </DialogDescription>
                                                </div>
                                            </div>
                                        </DialogHeader>
                                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-700">
                                                <strong>Course:</strong> {courseToDelete?.courseName}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Code: {courseToDelete?.courseCode}
                                            </p>
                                        </div>
                                        <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => setShowDeleteModal(false)}
                                                className="w-full sm:w-auto"
                                                disabled={isDeleting}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={confirmDelete}
                                                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 mb-2 sm:mb-0"
                                                disabled={isDeleting}
                                            >
                                                {isDeleting ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                        Deleting...
                                                    </>
                                                ) : (
                                                    "Delete Course"
                                                )}
                                            </Button>
                                        </DialogFooter>
                                    </motion.div>
                                </DialogContent>
                            </Dialog>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </DashboardLayoutProgramcoordinator>
    );
}