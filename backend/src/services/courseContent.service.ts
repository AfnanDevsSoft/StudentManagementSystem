import { prisma } from "../lib/db";
import path from "path";
import fs from "fs";

export class CourseContentService {
  private static readonly UPLOAD_DIR = path.join(
    process.cwd(),
    "uploads",
    "course-content"
  );

  /**
   * Upload course content
   */
  static async uploadContent(
    courseId: string,
    contentData: {
      contentType: string;
      title: string;
      description?: string;
      fileName: string;
      fileSize: number;
      filePath: string;
      duration?: number;
      uploadedBy: string;
    }
  ) {
    try {
      // Ensure upload directory exists
      if (!fs.existsSync(this.UPLOAD_DIR)) {
        fs.mkdirSync(this.UPLOAD_DIR, { recursive: true });
      }

      // Move file to upload directory
      const uploadedFileName = `${Date.now()}_${contentData.fileName}`;
      const uploadedFilePath = path.join(this.UPLOAD_DIR, uploadedFileName);
      fs.copyFileSync(contentData.filePath, uploadedFilePath);

      const content = await prisma.courseContent.create({
        data: {
          course_id: courseId,
          content_type: contentData.contentType as any,
          title: contentData.title,
          description: contentData.description,
          content_url: uploadedFilePath,
          file_name: uploadedFileName,
          file_size: contentData.fileSize,
          file_type: path.extname(contentData.fileName),
          duration: contentData.duration,
          uploaded_by: contentData.uploadedBy,
          is_published: false,
          sequence_order: 1,
        },
      });

      return {
        success: true,
        message: "Content uploaded successfully",
        data: content,
      };
    } catch (error: any) {
      console.error("Error uploading content:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get course content
   */
  static async getContent(
    courseId: string,
    limit: number = 20,
    offset: number = 0
  ) {
    try {
      const [content, total] = await Promise.all([
        prisma.courseContent.findMany({
          where: { course_id: courseId },
          orderBy: { sequence_order: "asc" },
          take: limit,
          skip: offset,
        }),
        prisma.courseContent.count({ where: { course_id: courseId } }),
      ]);

      return {
        success: true,
        message: "Content retrieved",
        data: content,
        pagination: {
          limit,
          offset,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      console.error("Error getting content:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get published content only
   */
  static async getPublishedContent(courseId: string) {
    try {
      const content = await prisma.courseContent.findMany({
        where: {
          course_id: courseId,
          is_published: true,
        },
        orderBy: { sequence_order: "asc" },
      });

      return {
        success: true,
        message: "Published content retrieved",
        data: content,
      };
    } catch (error: any) {
      console.error("Error getting published content:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Update content
   */
  static async updateContent(
    contentId: string,
    updateData: {
      title?: string;
      description?: string;
      duration?: number;
      sequence_order?: number;
      is_published?: boolean;
    }
  ) {
    try {
      const content = await prisma.courseContent.update({
        where: { id: contentId },
        data: updateData,
      });

      return {
        success: true,
        message: "Content updated",
        data: content,
      };
    } catch (error: any) {
      console.error("Error updating content:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Delete content
   */
  static async deleteContent(contentId: string) {
    try {
      const content = await prisma.courseContent.findUnique({
        where: { id: contentId },
      });

      if (content && content.file_name) {
        const filePath = path.join(this.UPLOAD_DIR, content.file_name);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      const deleted = await prisma.courseContent.delete({
        where: { id: contentId },
      });

      return {
        success: true,
        message: "Content deleted",
        data: deleted,
      };
    } catch (error: any) {
      console.error("Error deleting content:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Track content view
   */
  static async trackView(contentId: string) {
    try {
      const content = await prisma.courseContent.update({
        where: { id: contentId },
        data: {
          view_count: {
            increment: 1,
          },
          last_accessed: new Date(),
        },
      });

      return {
        success: true,
        message: "View tracked",
        data: content,
      };
    } catch (error: any) {
      console.error("Error tracking view:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Pin/Unpin content
   */
  static async pinContent(contentId: string, isPinned: boolean) {
    try {
      const content = await prisma.courseContent.update({
        where: { id: contentId },
        data: { is_pinned: isPinned },
      });

      return {
        success: true,
        message: `Content ${isPinned ? "pinned" : "unpinned"}`,
        data: content,
      };
    } catch (error: any) {
      console.error("Error pinning content:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get content by type
   */
  static async getContentByType(
    courseId: string,
    contentType: string,
    limit: number = 20
  ) {
    try {
      const content = await prisma.courseContent.findMany({
        where: {
          course_id: courseId,
          content_type: contentType,
        },
        orderBy: { sequence_order: "asc" },
        take: limit,
      });

      return {
        success: true,
        message: "Content by type retrieved",
        data: content,
      };
    } catch (error: any) {
      console.error("Error getting content by type:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Reorder content
   */
  static async reorderContent(
    courseId: string,
    contentOrder: Array<{ id: string; sequence: number }>
  ) {
    try {
      const updates = contentOrder.map((item) =>
        prisma.courseContent.update({
          where: { id: item.id },
          data: { sequence_order: item.sequence },
        })
      );

      await Promise.all(updates);

      const content = await prisma.courseContent.findMany({
        where: { course_id: courseId },
        orderBy: { sequence_order: "asc" },
      });

      return {
        success: true,
        message: "Content reordered",
        data: content,
      };
    } catch (error: any) {
      console.error("Error reordering content:", error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Get popular content
   */
  static async getPopularContent(courseId: string, limit: number = 10) {
    try {
      const content = await prisma.courseContent.findMany({
        where: { course_id: courseId, is_published: true },
        orderBy: { view_count: "desc" },
        take: limit,
      });

      return {
        success: true,
        message: "Popular content retrieved",
        data: content,
      };
    } catch (error: any) {
      console.error("Error getting popular content:", error);
      return { success: false, message: error.message };
    }
  }
}

export default CourseContentService;
