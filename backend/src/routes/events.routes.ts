import express, { Router, Request, Response } from "express";
import EventsService from "../services/events.service";
import { authMiddleware, sendResponse } from "../middleware/error.middleware";

const router: Router = express.Router();

// GET all events for a branch
router.get(
    "/",
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
        const { branch_id, event_type, start_date, end_date, is_holiday } = req.query;
        const result = await EventsService.getEvents(branch_id as string, {
            eventType: event_type,
            startDate: start_date,
            endDate: end_date,
            isHoliday: is_holiday === "true",
        }, (req as any).user);
        sendResponse(res, result.success ? 200 : 404, result.success, result.message, result.data);
    }
);

// GET upcoming events
router.get(
    "/upcoming",
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
        const { branch_id } = req.query;
        const result = await EventsService.getUpcomingEvents(branch_id as string, (req as any).user);
        sendResponse(res, result.success ? 200 : 404, result.success, result.message, result.data);
    }
);

// GET monthly calendar
router.get(
    "/calendar/:year/:month",
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
        const { year, month } = req.params;
        const { branch_id } = req.query;
        const result = await EventsService.getMonthlyCalendar(
            branch_id as string,
            parseInt(year),
            parseInt(month),
            (req as any).user
        );
        sendResponse(res, result.success ? 200 : 404, result.success, result.message, result.data);
    }
);

// POST create an event
router.post(
    "/",
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
        const result = await EventsService.createEvent(req.body, (req as any).user);
        sendResponse(res, result.success ? 201 : 400, result.success, result.message, result.data);
    }
);

// PATCH update an event
router.patch(
    "/:id",
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const result = await EventsService.updateEvent(id, req.body);
        sendResponse(res, result.success ? 200 : 400, result.success, result.message, result.data);
    }
);

// DELETE an event
router.delete(
    "/:id",
    authMiddleware,
    async (req: Request, res: Response): Promise<void> => {
        const { id } = req.params;
        const result = await EventsService.deleteEvent(id);
        sendResponse(res, result.success ? 200 : 400, result.success, result.message);
    }
);

export default router;
