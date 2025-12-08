import request from "supertest";
import app from "../../index";
import { sequelize } from "../../config/database";
import { testHelpers } from "../setup/helpers";

describe("Timetable Management API", () => {
    let authToken: string;
    let testBranchId: string;
    let testTimetableId: string;
    let testSlotId: string;

    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    beforeEach(async () => {
        const { token, branchId } = await testHelpers.createAuthenticatedUser();
        authToken = token;
        testBranchId = branchId;
    });

    afterAll(async () => {
        await sequelize.close();
    });

    describe("POST /api/v1/timetables", () => {
        it("should create a timetable", async () => {
            const response = await request(app)
                .post("/api/v1/timetables")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    name: "Grade 10 Timetable",
                    branch_id: testBranchId,
                    academic_year: "2024-2025",
                    semester: "Fall",
                    effective_date: new Date(),
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("id");
            expect(response.body.data.name).toBe("Grade 10 Timetable");

            testTimetableId = response.body.data.id;
        });

        it("should reject timetable without required fields", async () => {
            const response = await request(app)
                .post("/api/v1/timetables")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    name: "Incomplete Timetable",
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe("GET /api/v1/timetables", () => {
        it("should get all timetables", async () => {
            // Create a timetable first
            await request(app)
                .post("/api/v1/timetables")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    name: "Test Timetable",
                    branch_id: testBranchId,
                    academic_year: "2024-2025",
                });

            const response = await request(app)
                .get(`/api/v1/timetables?branch_id=${testBranchId}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });

    describe("POST /api/v1/timetables/:timetableId/slots", () => {
        it("should add a time slot to timetable", async () => {
            // Create timetable first
            const timetableResponse = await request(app)
                .post("/api/v1/timetables")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    name: "Slot Test Timetable",
                    branch_id: testBranchId,
                    academic_year: "2024-2025",
                });

            const timetableId = timetableResponse.body.data.id;

            const response = await request(app)
                .post(`/api/v1/timetables/${timetableId}/slots`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    day_of_week: "Monday",
                    start_time: "09:00",
                    end_time: "10:00",
                    subject: "Mathematics",
                    teacher_id: "test-teacher-123",
                    room: "Room 101",
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("id");
            expect(response.body.data.subject).toBe("Mathematics");

            testSlotId = response.body.data.id;
        });

        it("should detect time slot conflicts", async () => {
            // Create timetable
            const timetableResponse = await request(app)
                .post("/api/v1/timetables")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    name: "Conflict Test",
                    branch_id: testBranchId,
                });

            const timetableId = timetableResponse.body.data.id;

            // Add first slot
            await request(app)
                .post(`/api/v1/timetables/${timetableId}/slots`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    day_of_week: "Monday",
                    start_time: "09:00",
                    end_time: "10:00",
                    subject: "Math",
                    room: "Room 101",
                });

            // Try to add overlapping slot
            const response = await request(app)
                .post(`/api/v1/timetables/${timetableId}/slots`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    day_of_week: "Monday",
                    start_time: "09:30", // Overlaps with previous
                    end_time: "10:30",
                    subject: "Science",
                    room: "Room 101",
                });

            expect(response.status).toBe(409); // Conflict
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain("conflict");
        });
    });

    describe("GET /api/v1/timetables/:timetableId/slots", () => {
        it("should get all slots for a timetable", async () => {
            // Create timetable and add slot
            const timetableResponse = await request(app)
                .post("/api/v1/timetables")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    name: "Slots Test",
                    branch_id: testBranchId,
                });

            const timetableId = timetableResponse.body.data.id;

            await request(app)
                .post(`/api/v1/timetables/${timetableId}/slots`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    day_of_week: "Tuesday",
                    start_time: "10:00",
                    end_time: "11:00",
                    subject: "English",
                });

            const response = await request(app)
                .get(`/api/v1/timetables/${timetableId}/slots`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
        });
    });

    describe("PATCH /api/v1/timetables/:timetableId/slots/:slotId", () => {
        it("should update a time slot", async () => {
            // Create timetable and slot
            const timetableResponse = await request(app)
                .post("/api/v1/timetables")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    name: "Update Test",
                    branch_id: testBranchId,
                });

            const timetableId = timetableResponse.body.data.id;

            const slotResponse = await request(app)
                .post(`/api/v1/timetables/${timetableId}/slots`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    day_of_week: "Wednesday",
                    start_time: "11:00",
                    end_time: "12:00",
                    subject: "History",
                });

            const slotId = slotResponse.body.data.id;

            const response = await request(app)
                .patch(`/api/v1/timetables/${timetableId}/slots/${slotId}`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    subject: "Geography",
                    room: "Room 202",
                });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.subject).toBe("Geography");
            expect(response.body.data.room).toBe("Room 202");
        });
    });

    describe("DELETE /api/v1/timetables/:timetableId/slots/:slotId", () => {
        it("should delete a time slot", async () => {
            // Create timetable and slot
            const timetableResponse = await request(app)
                .post("/api/v1/timetables")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    name: "Delete Test",
                    branch_id: testBranchId,
                });

            const timetableId = timetableResponse.body.data.id;

            const slotResponse = await request(app)
                .post(`/api/v1/timetables/${timetableId}/slots`)
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    day_of_week: "Thursday",
                    start_time: "14:00",
                    end_time: "15:00",
                    subject: "Art",
                });

            const slotId = slotResponse.body.data.id;

            const response = await request(app)
                .delete(`/api/v1/timetables/${timetableId}/slots/${slotId}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });
});
