import { baseApi } from "../baseApi";
import type { Attachment, AttachmentListResponse } from "./attachment-types";
import type { ApiResponse, ApiDeleteResponse } from "../shared-types";

const BASE = "/attachments";

export const attachmentApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (build) => ({
    getAttachments: build.query<AttachmentListResponse, void>({
      query: () => ({ url: BASE }),
      providesTags: ["Attachment"],
    }),

    getAttachmentById: build.query<ApiResponse<Attachment>, string>({
      query: (id) => ({ url: `${BASE}/${id}` }),
      providesTags: (_, __, id) => [{ type: "Attachment", id }],
    }),

    createAttachment: build.mutation<
      ApiResponse<Attachment>,
      FormData | Record<string, unknown>
    >({
      query: (body) => ({ url: BASE, method: "POST", body }),
      invalidatesTags: ["Attachment", "Stakeholder", "Student"],
    }),

    updateAttachment: build.mutation<
      ApiResponse<Attachment>,
      { id: string; data: FormData | Record<string, unknown> }
    >({
      query: ({ id, data }) => ({
        url: `${BASE}/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: "Attachment", id },
        "Attachment",
      ],
    }),

    deleteAttachment: build.mutation<ApiDeleteResponse, string>({
      query: (id) => ({ url: `${BASE}/${id}`, method: "DELETE" }),
      invalidatesTags: (_, __, id) => [
        { type: "Attachment", id },
        "Attachment",
      ],
    }),
  }),
});

export const {
  useGetAttachmentsQuery,
  useGetAttachmentByIdQuery,
  useCreateAttachmentMutation,
  useUpdateAttachmentMutation,
  useDeleteAttachmentMutation,
} = attachmentApi;
