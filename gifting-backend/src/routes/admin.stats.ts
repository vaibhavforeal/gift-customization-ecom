// GET /api/admin/stats - lightweight dashboard cards.
// Today's orders, week revenue, pending payments, by-status counts.

import { Router } from "express";
import { prisma } from "../config/prisma";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const weekAgo = new Date(startOfToday);
    weekAgo.setDate(weekAgo.getDate() - 6); // last 7 days incl. today

    const [
      ordersToday,
      ordersThisWeek,
      pendingOrders,
      unpaidOrders,
      paidWeekAgg,
      byStatus,
    ] = await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.order.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { paymentStatus: "UNPAID" } }),
      prisma.order.aggregate({
        _sum: { subtotal: true },
        where: {
          paymentStatus: "PAID",
          createdAt: { gte: weekAgo },
        },
      }),
      prisma.order.groupBy({
        by: ["status"],
        _count: true,
      }),
    ]);

    res.json({
      ordersToday,
      ordersThisWeek,
      pendingOrders,
      unpaidOrders,
      revenuePaidLast7Days: Number(paidWeekAgg._sum.subtotal ?? 0),
      ordersByStatus: byStatus.reduce(
        (acc, row) => ({ ...acc, [row.status]: row._count }),
        {} as Record<string, number>
      ),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
