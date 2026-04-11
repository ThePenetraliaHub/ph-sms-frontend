export {
  useGetGradesQuery,
  useGetGradeByIdQuery,
  useCreateGradeMutation,
  useUpdateGradeMutation,
  useDeleteGradeMutation,
} from "./grades/grades";

export { useGetNoticesQuery, useGetNoticeByIdQuery } from "./notices/notices";
export type {
  Notice,
  NoticesListResponse,
  NoticesQueryParams,
} from "./notices/notice-types";

export {
  useGetCalendarEventsQuery,
  useGetCalendarEventByIdQuery,
} from "./calendar/calendar";
export type {
  CalendarEvent,
  CalendarEventsListResponse,
  CalendarEventsQueryParams,
} from "./calendar/calendar-type";

export {
  useGetMessagesQuery,
  useGetMessageByIdQuery,
  useCreateMessageMutation,
  useMarkAsReadMutation,
  useDeleteMessageMutation,
} from "./messages/messages";

export type { Message, CreateMessageRequest } from "./messages/messages-type";

export {
  useGetNotificationsQuery,
  useGetNotificationByIdQuery,
  useCreateNotificationMutation,
  useUpdateNotificationMutation,
  useDeleteNotificationMutation,
  useMarkNotificationReadMutation,
} from "./notifications/notification";

export type {
  Notifications,
  NotificationsListResponse,
  CreateNotifications,
  UpdateNotifications,
} from "./notifications/notification-types";

export {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from "./products/products";

export type { Product, ProductsQueryParams } from "./products/products-type";

export {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
} from "./orders/orders";

export type {
  Order,
  CreateOrderRequest,
  OrderItems,
  OrdersQueryParams,
} from "./orders/orders-type";
