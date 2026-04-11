"use client";

import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/authSlice";
import { useGetNotificationsQuery } from "@/services/notifications/notification";
import type { Notifications } from "@/services/notifications/notification-types";
import type { UserRole } from "@/lib/types";

function filterByRole(
  notifications: Notifications[],
  role: UserRole,
): Notifications[] {
  const active = notifications.filter(
    (n) => n.status === "active" && !n.is_deleted,
  );
  if (role === "admin") return active;
  return active.filter(
    (n) =>
      n.target_audience === "general" ||
      (Array.isArray(n.specifics) &&
        n.specifics.some((s) => String(s).toLowerCase() === role)),
  );
}

export function useUnreadNoticeCount(): number {
  const user = useAppSelector(selectUser);
  const role = (user?.role ?? "admin") as UserRole;
  const { data } = useGetNotificationsQuery(
    { per_page: 500 },
    { skip: !user?.id },
  );

  return useMemo(() => {
    const list = data?.data ?? [];
    const visible = filterByRole(list, role);
    if (!user?.id) return visible.length;
    return visible.filter(
      (n) => !Array.isArray(n.read_users) || !n.read_users.includes(user.id),
    ).length;
  }, [data?.data, user?.id, role]);
}
