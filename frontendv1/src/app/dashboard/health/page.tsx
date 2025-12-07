"use client";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import apiClient from "@/lib/apiClient";
import { Heart, Plus, Activity, Syringe, AlertCircle } from "lucide-react";

interface HealthRecord {
    id: string;
    student_id: string;
    blood_group?: string;
    allergies?: string;
    emergency_contact?: string;
    emergency_phone?: string;
}

export default function HealthPage() {
    const [activeTab, setActiveTab] = useState<"search" | "incidents">("search");
    const [studentId, setStudentId] = useState("");
    const [healthRecord, setHealthRecord] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [showIncidentModal, setShowIncidentModal] = useState(false);

    const handleSearch = async () => {
        if (!studentId) {
            toast.error("Please enter a student ID");
            return;
        }
        setLoading(true);
        try {
            const response = await apiClient.getHealthSummary(studentId);
            if (response.data.success) {
                setHealthRecord(response.data.data);
            } else {
                toast.error("Student not found or no health record");
            }
        } catch (error) {
            toast.error("Failed to fetch health record");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Health Records</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Manage student health profiles, medical checkups, and incidents
                        </p>
                    </div>
                    <button
                        onClick={() => setShowIncidentModal(true)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
                    >
                        <AlertCircle size={18} />
                        Report Incident
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b px-6">
                <div className="flex space-x-8">
                    <button
                        onClick={() => setActiveTab("search")}
                        className={`py-4 px-2 border-b-2 font-medium text-sm ${activeTab === "search"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500"
                            }`}
                    >
                        <Heart className="inline mr-2" size={18} />
                        Health Records
                    </button>
                    <button
                        onClick={() => setActiveTab("incidents")}
                        className={`py-4 px-2 border-b-2 font-medium text-sm ${activeTab === "incidents"
                                ? "border-blue-500 text-blue-600"
                                : "border-transparent text-gray-500"
                            }`}
                    >
                        <AlertCircle className="inline mr-2" size={18} />
                        Recent Incidents
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {activeTab === "search" && (
                    <div className="space-y-6">
                        {/* Search */}
                        <div className="bg-white rounded-lg shadow p-6">
                            <h2 className="font-semibold mb-4">Search Student Health Record</h2>
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    placeholder="Enter student ID..."
                                    value={studentId}
                                    onChange={(e) => setStudentId(e.target.value)}
                                    className="flex-1 px-4 py-2 border rounded-lg"
                                />
                                <button
                                    onClick={handleSearch}
                                    disabled={loading}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {loading ? "Searching..." : "Search"}
                                </button>
                            </div>
                        </div>

                        {/* Health Record Display */}
                        {healthRecord && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Basic Info */}
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                                        <Heart className="text-red-500" size={20} />
                                        Basic Information
                                    </h3>
                                    <div className="space-y-3 text-sm">
                                        <div>
                                            <span className="text-gray-500">Student:</span>{" "}
                                            {healthRecord.health_record?.student?.first_name}{" "}
                                            {healthRecord.health_record?.student?.last_name}
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Blood Group:</span>{" "}
                                            <span className="font-semibold">{healthRecord.health_record?.blood_group || "N/A"}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Allergies:</span>{" "}
                                            {healthRecord.health_record?.allergies || "None"}
                                        </div>
                                        <div className="pt-3 border-t">
                                            <div className="font-medium text-red-600">Emergency Contact</div>
                                            <div>{healthRecord.health_record?.emergency_contact || "N/A"}</div>
                                            <div className="text-xs">{healthRecord.health_record?.emergency_phone || "N/A"}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Checkups */}
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                                        <Activity className="text-green-500" size={20} />
                                        Recent Checkups
                                    </h3>
                                    <div className="space-y-3">
                                        {healthRecord.recent_checkups?.length > 0 ? (
                                            healthRecord.recent_checkups.map((checkup: any, index: number) => (
                                                <div key={index} className="text-sm border-b pb-2">
                                                    <div className="font-medium">
                                                        {new Date(checkup.checkup_date).toLocaleDateString()}
                                                    </div>
                                                    <div className="text-gray-600 text-xs">{checkup.findings || "No findings"}</div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 text-sm">No checkups recorded</p>
                                        )}
                                    </div>
                                </div>

                                {/* Vaccinations */}
                                <div className="bg-white rounded-lg shadow p-6">
                                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                                        <Syringe className="text-blue-500" size={20} />
                                        Vaccinations
                                    </h3>
                                    <div className="space-y-3">
                                        {healthRecord.recent_vaccinations?.length > 0 ? (
                                            healthRecord.recent_vaccinations.map((vax: any, index: number) => (
                                                <div key={index} className="text-sm border-b pb-2">
                                                    <div className="font-medium">{vax.vaccine_name}</div>
                                                    <div className="text-gray-600 text-xs">
                                                        {new Date(vax.administered_date).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 text-sm">No vaccinations recorded</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "incidents" && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="font-semibold mb-4">Recent Medical Incidents</h2>
                        <p className="text-gray-600">Incident tracking feature coming soon</p>
                    </div>
                )}
            </div>

            {/* Incident Modal */}
            {showIncidentModal && (
                <IncidentModal onClose={() => setShowIncidentModal(false)} />
            )}
        </div>
    );
}

function IncidentModal({ onClose }: { onClose: () => void }) {
    const [formData, setFormData] = useState({
        student_id: "",
        incident_type: "injury",
        severity: "minor",
        description: "",
        treatment_given: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await apiClient.reportMedicalIncident(formData);
            toast.success("Incident reported successfully");
            onClose();
        } catch (error) {
            toast.error("Failed to report incident");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Report Medical Incident</h2>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Student ID *</label>
                            <input
                                type="text"
                                value={formData.student_id}
                                onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Type *</label>
                                <select
                                    value={formData.incident_type}
                                    onChange={(e) => setFormData({ ...formData, incident_type: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    <option value="injury">Injury</option>
                                    <option value="illness">Illness</option>
                                    <option value="emergency">Emergency</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Severity *</label>
                                <select
                                    value={formData.severity}
                                    onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    <option value="minor">Minor</option>
                                    <option value="moderate">Moderate</option>
                                    <option value="severe">Severe</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Description *</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                                rows={3}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Treatment Given</label>
                            <textarea
                                value={formData.treatment_given}
                                onChange={(e) => setFormData({ ...formData, treatment_given: e.target.value })}
                                className="w-full px-3 py-2 border rounded-lg"
                                rows={2}
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Report Incident
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
