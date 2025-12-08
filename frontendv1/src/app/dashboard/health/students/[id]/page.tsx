"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { apiClient } from "@/lib/apiClient";
import DashboardLayout from "@/components/DashboardLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import PermissionGuard from "@/components/PermissionGuard";
import Modal from "@/components/Modal";
import { adminSidebarItems } from "@/config/sidebarConfig";
import {
    Heart,
    Syringe,
    Activity,
    AlertCircle,
    Plus,
    Calendar,
    User,
    Phone,
    FileText,
    Edit2,
    Trash2,
    ArrowLeft,
    Save,
    X,
} from "lucide-react";
import toast from "react-hot-toast";

interface MedicalRecord {
    id: string;
    student_id: string;
    blood_type?: string;
    allergies?: string[];
    chronic_conditions?: string[];
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    emergency_contact_relationship?: string;
    last_checkup_date?: string;
    notes?: string;
}

interface Vaccination {
    id: string;
    vaccine_name: string;
    date_administered: string;
    administered_by?: string;
    next_due_date?: string;
    notes?: string;
}

interface Checkup {
    id: string;
    checkup_date: string;
    height?: number;
    weight?: number;
    blood_pressure?: string;
    temperature?: number;
    findings?: string;
    doctor_name?: string;
}

export default function StudentMedicalRecordPage() {
    const params = useParams();
    const router = useRouter();
    const studentId = params?.id as string;

    const [loading, setLoading] = useState(true);
    const [student, setStudent] = useState<any>(null);
    const [medicalRecord, setMedicalRecord] = useState<MedicalRecord | null>(null);
    const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
    const [checkups, setCheckups] = useState<Checkup[]>([]);

    const [showVaccinationModal, setShowVaccinationModal] = useState(false);
    const [showCheckupModal, setShowCheckupModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    const [vaccinationForm, setVaccinationForm] = useState({
        vaccine_name: "",
        date_administered: "",
        administered_by: "",
        next_due_date: "",
        notes: "",
    });

    const [checkupForm, setCheckupForm] = useState({
        checkup_date: "",
        height: "",
        weight: "",
        blood_pressure: "",
        temperature: "",
        findings: "",
        doctor_name: "",
    });

    const [medicalRecordForm, setMedicalRecordForm] = useState({
        blood_type: "",
        allergies: "",
        chronic_conditions: "",
        emergency_contact_name: "",
        emergency_contact_phone: "",
        emergency_contact_relationship: "",
        notes: "",
    });

    useEffect(() => {
        if (studentId) {
            fetchData();
        }
    }, [studentId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch student details
            const studentResponse = await apiClient.getStudent(studentId);
            setStudent(studentResponse.data);

            // Fetch medical record
            try {
                const healthResponse = await apiClient.getHealthSummary(studentId);
                if (healthResponse.data) {
                    setMedicalRecord(healthResponse.data.health_record);
                    setVaccinations(healthResponse.data.recent_vaccinations || []);
                    setCheckups(healthResponse.data.recent_checkups || []);

                    // Pre-fill form
                    const record = healthResponse.data.health_record;
                    setMedicalRecordForm({
                        blood_type: record?.blood_group || "",
                        allergies: record?.allergies || "",
                        chronic_conditions: record?.chronic_conditions || "",
                        emergency_contact_name: record?.emergency_contact || "",
                        emergency_contact_phone: record?.emergency_phone || "",
                        emergency_contact_relationship: record?.relationship || "",
                        notes: record?.notes || "",
                    });
                }
            } catch (error) {
                console.log("No medical record found, will create one");
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Failed to load student data");
        } finally {
            setLoading(false);
        }
    };

    const handleSaveMedicalRecord = async () => {
        try {
            const data = {
                student_id: studentId,
                blood_group: medicalRecordForm.blood_type,
                allergies: medicalRecordForm.allergies,
                chronic_conditions: medicalRecordForm.chronic_conditions,
                emergency_contact: medicalRecordForm.emergency_contact_name,
                emergency_phone: medicalRecordForm.emergency_contact_phone,
                relationship: medicalRecordForm.emergency_contact_relationship,
                notes: medicalRecordForm.notes,
            };

            if (medicalRecord) {
                await apiClient.updateHealthRecord(medicalRecord.id, data);
                toast.success("Medical record updated");
            } else {
                await apiClient.createHealthRecord(data);
                toast.success("Medical record created");
            }

            setShowEditModal(false);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save record");
        }
    };

    const handleAddVaccination = async () => {
        try {
            await apiClient.recordVaccination({
                student_id: studentId,
                ...vaccinationForm,
            });
            toast.success("Vaccination recorded");
            setShowVaccinationModal(false);
            setVaccinationForm({
                vaccine_name: "",
                date_administered: "",
                administered_by: "",
                next_due_date: "",
                notes: "",
            });
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to record vaccination");
        }
    };

    const handleAddCheckup = async () => {
        try {
            await apiClient.recordMedicalCheckup({
                student_id: studentId,
                ...checkupForm,
                height: checkupForm.height ? parseFloat(checkupForm.height) : undefined,
                weight: checkupForm.weight ? parseFloat(checkupForm.weight) : undefined,
                temperature: checkupForm.temperature ? parseFloat(checkupForm.temperature) : undefined,
            });
            toast.success("Checkup recorded");
            setShowCheckupModal(false);
            setCheckupForm({
                checkup_date: "",
                height: "",
                weight: "",
                blood_pressure: "",
                temperature: "",
                findings: "",
                doctor_name: "",
            });
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to record checkup");
        }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <DashboardLayout title="Medical Record" sidebarItems={adminSidebarItems}>
                    <div className="flex items-center justify-center h-64">
                        <div className="text-gray-500">Loading...</div>
                    </div>
                </DashboardLayout>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <DashboardLayout title="Student Medical Record" sidebarItems={adminSidebarItems}>
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => router.back()}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {student?.first_name} {student?.last_name}
                                </h2>
                                <p className="text-sm text-gray-600">
                                    {student?.student_code} • Medical Record
                                </p>
                            </div>
                        </div>
                        <PermissionGuard permission="manage_medical_records">
                            <button
                                onClick={() => setShowEditModal(true)}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                <Edit2 size={16} />
                                <span>Edit Record</span>
                            </button>
                        </PermissionGuard>
                    </div>

                    {/* Medical Record Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Basic Info */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center space-x-2 mb-4">
                                <Heart className="text-red-500" size={20} />
                                <h3 className="font-semibold text-gray-800">Basic Information</h3>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <span className="text-gray-500">Blood Type:</span>
                                    <span className="ml-2 font-semibold text-red-600">
                                        {medicalRecord?.blood_group || "Not specified"}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Allergies:</span>
                                    <p className="mt-1 text-gray-900">
                                        {medicalRecord?.allergies || "None reported"}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Chronic Conditions:</span>
                                    <p className="mt-1 text-gray-900">
                                        {medicalRecord?.chronic_conditions || "None reported"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Emergency Contact */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center space-x-2 mb-4">
                                <Phone className="text-orange-500" size={20} />
                                <h3 className="font-semibold text-gray-800">Emergency Contact</h3>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <span className="text-gray-500">Name:</span>
                                    <p className="mt-1 font-medium text-gray-900">
                                        {medicalRecord?.emergency_contact || "Not specified"}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Phone:</span>
                                    <p className="mt-1 font-medium text-gray-900">
                                        {medicalRecord?.emergency_phone || "Not specified"}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Relationship:</span>
                                    <p className="mt-1 text-gray-900">
                                        {medicalRecord?.relationship || "Not specified"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Last Checkup */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center space-x-2 mb-4">
                                <Activity className="text-green-500" size={20} />
                                <h3 className="font-semibold text-gray-800">Last Checkup</h3>
                            </div>
                            {checkups.length > 0 ? (
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="text-gray-500">Date:</span>
                                        <p className="mt-1 font-medium">
                                            {new Date(checkups[0].checkup_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Height/Weight:</span>
                                        <p className="mt-1">
                                            {checkups[0].height || "N/A"} cm / {checkups[0].weight || "N/A"} kg
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Doctor:</span>
                                        <p className="mt-1">{checkups[0].doctor_name || "N/A"}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No checkups recorded</p>
                            )}
                        </div>
                    </div>

                    {/* Vaccinations */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Syringe className="text-blue-500" size={20} />
                                <h3 className="font-semibold text-gray-800">Vaccination History</h3>
                            </div>
                            <PermissionGuard permission="manage_medical_records">
                                <button
                                    onClick={() => setShowVaccinationModal(true)}
                                    className="flex items-center space-x-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    <Plus size={16} />
                                    <span>Add Vaccination</span>
                                </button>
                            </PermissionGuard>
                        </div>
                        <div className="p-6">
                            {vaccinations.length > 0 ? (
                                <div className="space-y-3">
                                    {vaccinations.map((vax) => (
                                        <div
                                            key={vax.id}
                                            className="border-l-4 border-green-500 pl-4 py-2"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900">
                                                        {vax.vaccine_name}
                                                    </h4>
                                                    <p className="text-sm text-gray-600">
                                                        Administered: {new Date(vax.date_administered).toLocaleDateString()}
                                                    </p>
                                                    {vax.administered_by && (
                                                        <p className="text-xs text-gray-500">
                                                            By: {vax.administered_by}
                                                        </p>
                                                    )}
                                                </div>
                                                {vax.next_due_date && (
                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-500">Next Due:</p>
                                                        <p className="text-sm font-medium text-orange-600">
                                                            {new Date(vax.next_due_date).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-4">
                                    No vaccinations recorded
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Medical Checkups */}
                    <div className="bg-white rounded-lg shadow">
                        <div className="px-6 py-4 border-b flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Activity className="text-purple-500" size={20} />
                                <h3 className="font-semibold text-gray-800">Checkup History</h3>
                            </div>
                            <PermissionGuard permission="manage_medical_records">
                                <button
                                    onClick={() => setShowCheckupModal(true)}
                                    className="flex items-center space-x-2 px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                >
                                    <Plus size={16} />
                                    <span>Record Checkup</span>
                                </button>
                            </PermissionGuard>
                        </div>
                        <div className="p-6">
                            {checkups.length > 0 ? (
                                <div className="space-y-4">
                                    {checkups.map((checkup) => (
                                        <div
                                            key={checkup.id}
                                            className="border border-gray-200 rounded-lg p-4"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {new Date(checkup.checkup_date).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Dr. {checkup.doctor_name || "Not specified"}
                                                    </p>
                                                </div>
                                                <div className="text-right text-sm">
                                                    <p className="text-gray-600">
                                                        {checkup.height} cm • {checkup.weight} kg
                                                    </p>
                                                    <p className="text-gray-600">
                                                        BP: {checkup.blood_pressure || "N/A"} • Temp: {checkup.temperature || "N/A"}°C
                                                    </p>
                                                </div>
                                            </div>
                                            {checkup.findings && (
                                                <div className="mt-2 pt-2 border-t">
                                                    <p className="text-sm text-gray-700">{checkup.findings}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-4">
                                    No checkups recorded
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Edit Medical Record Modal */}
                <Modal
                    isOpen={showEditModal}
                    onClose={() => setShowEditModal(false)}
                    title="Edit Medical Record"
                    size="lg"
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Blood Type
                                </label>
                                <select
                                    value={medicalRecordForm.blood_type}
                                    onChange={(e) =>
                                        setMedicalRecordForm({ ...medicalRecordForm, blood_type: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="">Select</option>
                                    <option value="A+">A+</option>
                                    <option value="A-">A-</option>
                                    <option value="B+">B+</option>
                                    <option value="B-">B-</option>
                                    <option value="O+">O+</option>
                                    <option value="O-">O-</option>
                                    <option value="AB+">AB+</option>
                                    <option value="AB-">AB-</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Allergies
                            </label>
                            <textarea
                                value={medicalRecordForm.allergies}
                                onChange={(e) =>
                                    setMedicalRecordForm({ ...medicalRecordForm, allergies: e.target.value })
                                }
                                rows={2}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                placeholder="List any allergies..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Chronic Conditions
                            </label>
                            <textarea
                                value={medicalRecordForm.chronic_conditions}
                                onChange={(e) =>
                                    setMedicalRecordForm({ ...medicalRecordForm, chronic_conditions: e.target.value })
                                }
                                rows={2}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                placeholder="List any chronic conditions..."
                            />
                        </div>

                        <div className="pt-4 border-t">
                            <h4 className="font-semibold mb-3">Emergency Contact</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        value={medicalRecordForm.emergency_contact_name}
                                        onChange={(e) =>
                                            setMedicalRecordForm({ ...medicalRecordForm, emergency_contact_name: e.target.value })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone
                                    </label>
                                    <input
                                        type="text"
                                        value={medicalRecordForm.emergency_contact_phone}
                                        onChange={(e) =>
                                            setMedicalRecordForm({ ...medicalRecordForm, emergency_contact_phone: e.target.value })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                            </div>
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Relationship
                                </label>
                                <input
                                    type="text"
                                    value={medicalRecordForm.emergency_contact_relationship}
                                    onChange={(e) =>
                                        setMedicalRecordForm({ ...medicalRecordForm, emergency_contact_relationship: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                    placeholder="e.g., Mother, Father, Guardian"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveMedicalRecord}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </Modal>

                {/* Add Vaccination Modal */}
                <Modal
                    isOpen={showVaccinationModal}
                    onClose={() => setShowVaccinationModal(false)}
                    title="Record Vaccination"
                    size="md"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Vaccine Name *
                            </label>
                            <input
                                type="text"
                                value={vaccinationForm.vaccine_name}
                                onChange={(e) =>
                                    setVaccinationForm({ ...vaccinationForm, vaccine_name: e.target.value })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                placeholder="e.g., COVID-19, MMR, Hepatitis B"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date Administered *
                                </label>
                                <input
                                    type="date"
                                    value={vaccinationForm.date_administered}
                                    onChange={(e) =>
                                        setVaccinationForm({ ...vaccinationForm, date_administered: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Next Due Date
                                </label>
                                <input
                                    type="date"
                                    value={vaccinationForm.next_due_date}
                                    onChange={(e) =>
                                        setVaccinationForm({ ...vaccinationForm, next_due_date: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Administered By
                            </label>
                            <input
                                type="text"
                                value={vaccinationForm.administered_by}
                                onChange={(e) =>
                                    setVaccinationForm({ ...vaccinationForm, administered_by: e.target.value })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                placeholder="Doctor/Nurse name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notes
                            </label>
                            <textarea
                                value={vaccinationForm.notes}
                                onChange={(e) =>
                                    setVaccinationForm({ ...vaccinationForm, notes: e.target.value })
                                }
                                rows={2}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                onClick={() => setShowVaccinationModal(false)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddVaccination}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                Record Vaccination
                            </button>
                        </div>
                    </div>
                </Modal>

                {/* Add Checkup Modal */}
                <Modal
                    isOpen={showCheckupModal}
                    onClose={() => setShowCheckupModal(false)}
                    title="Record Medical Checkup"
                    size="lg"
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Checkup Date *
                                </label>
                                <input
                                    type="date"
                                    value={checkupForm.checkup_date}
                                    onChange={(e) =>
                                        setCheckupForm({ ...checkupForm, checkup_date: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Doctor Name
                                </label>
                                <input
                                    type="text"
                                    value={checkupForm.doctor_name}
                                    onChange={(e) =>
                                        setCheckupForm({ ...checkupForm, doctor_name: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Height (cm)
                                </label>
                                <input
                                    type="number"
                                    value={checkupForm.height}
                                    onChange={(e) =>
                                        setCheckupForm({ ...checkupForm, height: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Weight (kg)
                                </label>
                                <input
                                    type="number"
                                    value={checkupForm.weight}
                                    onChange={(e) =>
                                        setCheckupForm({ ...checkupForm, weight: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    BP
                                </label>
                                <input
                                    type="text"
                                    value={checkupForm.blood_pressure}
                                    onChange={(e) =>
                                        setCheckupForm({ ...checkupForm, blood_pressure: e.target.value })
                                    }
                                    placeholder="120/80"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Temp (°C)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={checkupForm.temperature}
                                    onChange={(e) =>
                                        setCheckupForm({ ...checkupForm, temperature: e.target.value })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Findings & Notes
                            </label>
                            <textarea
                                value={checkupForm.findings}
                                onChange={(e) =>
                                    setCheckupForm({ ...checkupForm, findings: e.target.value })
                                }
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                                placeholder="Medical findings, recommendations, etc."
                            />
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                onClick={() => setShowCheckupModal(false)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddCheckup}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                            >
                                Record Checkup
                            </button>
                        </div>
                    </div>
                </Modal>
            </DashboardLayout>
        </ProtectedRoute>
    );
}
