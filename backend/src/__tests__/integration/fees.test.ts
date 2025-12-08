import request from "supertest";
import app from "../../index";
import { sequelize } from "../../config/database";
import { testHelpers } from "../setup/helpers";

describe("Fee Management API", () => {
    let authToken: string;
    let testBranchId: string;
    let testStudentId: string;
    let testFeeStructureId: string;

    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    beforeEach(async () => {
        // Create test user and get auth token
        const { token, branchId } = await testHelpers.createAuthenticatedUser();
        authToken = token;
        testBranchId = branchId;

        // Create test student
        const studentResponse = await request(app)
            .post("/api/v1/students")
            .set("Authorization", `Bearer ${authToken}`)
            .send({
                first_name: "Test",
                last_name: "Student",
                email: "test.student@example.com",
                branch_id: testBranchId,
                enrollment_date: new Date(),
            });
        testStudentId = studentResponse.body.data.id;
    });

    afterAll(async () => {
        await sequelize.close();
    });

    describe("POST /api/v1/fees/structures", () => {
        it("should create a fee structure", async () => {
            const response = await request(app)
                .post("/api/v1/fees/structures")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    name: "Monthly Tuition",
                    amount: 5000,
                    frequency: "monthly",
                    branch_id: testBranchId,
                    academic_year: "2024-2025",
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("id");
            expect(response.body.data.name).toBe("Monthly Tuition");
            expect(response.body.data.amount).toBe(5000);

            testFeeStructureId = response.body.data.id;
        });

        it("should reject fee structure without required fields", async () => {
            const response = await request(app)
                .post("/api/v1/fees/structures")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    name: "Incomplete Fee",
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe("GET /api/v1/fees/structures", () => {
        it("should get all fee structures for a branch", async () => {
            // Create a fee structure first
            await request(app)
                .post("/api/v1/fees/structures")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    name: "Annual Fee",
                    amount: 10000,
                    frequency: "annual",
                    branch_id: testBranchId,
                });

            const response = await request(app)
                .get(`/api/v1/fees/structures?branch_id=${testBranchId}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
            expect(response.body.data.length).toBeGreaterThan(0);
        });
    });

    describe("POST /api/v1/fees/payments", () => {
        it("should record a fee payment", async () => {
            const response = await request(app)
                .post("/api/v1/fees/payments")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    studentId: testStudentId,
                    amount: 5000,
                    paymentMethod: "cash",
                    feeType: "tuition",
                });

            expect(response.status).toBe(201);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("id");
            expect(response.body.data.amount).toBe(5000);
            expect(response.body.data.student_id).toBe(testStudentId);
        });

        it("should reject payment with invalid amount", async () => {
            const response = await request(app)
                .post("/api/v1/fees/payments")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    studentId: testStudentId,
                    amount: -100, // Negative amount
                    paymentMethod: "cash",
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });
    });

    describe("GET /api/v1/fees/students/:studentId", () => {
        it("should get fee details for a student", async () => {
            // Record a payment first
            await request(app)
                .post("/api/v1/fees/payments")
                .set("Authorization", `Bearer ${authToken}`)
                .send({
                    studentId: testStudentId,
                    amount: 3000,
                    paymentMethod: "online",
                    feeType: "tuition",
                });

            const response = await request(app)
                .get(`/api/v1/fees/students/${testStudentId}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("payments");
            expect(Array.isArray(response.body.data.payments)).toBe(true);
        });
    });

    describe("GET /api/v1/fees/due", () => {
        it("should get all due payments", async () => {
            const response = await request(app)
                .get(`/api/v1/fees/due?branch_id=${testBranchId}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });

    describe("GET /api/v1/fees/reports", () => {
        it("should generate fee reports", async () => {
            const response = await request(app)
                .get(`/api/v1/fees/reports?branch_id=${testBranchId}`)
                .set("Authorization", `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data).toHaveProperty("summary");
        });
    });
});
