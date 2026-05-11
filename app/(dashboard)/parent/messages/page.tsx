/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useState, useMemo, useEffect } from "react";
import {
  MessageThreadsList,
  ChatConversation,
} from "@/components/dashboard-pages/admin/messages/components";
import { Icon } from "@/components/general/huge-icon";
import {
  SharedDriveIcon,
  MessageCancel01Icon,
} from "@hugeicons/core-free-icons";
import { ChatHeader } from "@/components/dashboard-pages/admin/messages/components";
import { MessageInput } from "@/components/dashboard-pages/admin/messages/components";
import {
  useGetChatsQuery,
  useGetChatByIdQuery,
  useLazyGetChatByIdQuery,
  useSendChatMutation,
} from "@/services/chats/chats";
import { useGetUsersQuery } from "@/services/users/users";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/authSlice";
import { format } from "date-fns";
import type {
  Chat,
  ChatMessages,
  ChatParticipants,
  SendChatPayload,
} from "@/services/chats/chat-types";

const MESSAGE_PAGE_SIZE = 20;

interface MessageThread {
  id: string;
  name: string;
  description: string;
  lastMessage?: string;
  timestamp?: string;
  unreadCount?: number;
  avatar?: string;
  icon?: any;
  type: "general" | "group" | "individual";
}

interface Message {
  id: string;
  senderName: string;
  senderEmail: string;
  message: string;
  timestamp: string;
  avatar?: string;
  isOwnMessage?: boolean;
}

export default function ParentMessagesPage() {
  const user = useAppSelector(selectUser);
  const [selectedThreadId, setSelectedThreadId] = useState<string>("general");
  const [individualThreads, setIndividualThreads] = useState<MessageThread[]>(
    [],
  );
  const [staticThreadMessages, setStaticThreadMessages] = useState<
    Record<"general", ChatMessages[]>
  >({ general: [] });
  const [individualThreadMessages, setIndividualThreadMessages] = useState<
    Record<string, ChatMessages[]>
  >({});
  const [accumulatedMessages, setAccumulatedMessages] = useState<
    Record<string, { messages: ChatMessages[]; hasMore: boolean }>
  >({});

  const { data: chatsData } = useGetChatsQuery({ limit: 50 });
  const { data: contactsData } = useGetUsersQuery({
    role: "teacher",
    limit: 100,
  });

  const isIndividualThread = individualThreads.some(
    (t) => t.id === selectedThreadId,
  );

  const chatIdToFetch = useMemo(() => {
    if (!selectedThreadId || !chatsData?.data) return undefined;
    if (selectedThreadId === "general") {
      return chatsData.data.find((c: Chat) => c.type === "general")?.id;
    }
    if (isIndividualThread) {
      const oneToOne = chatsData.data.find(
        (c: Chat) =>
          c.participants?.length === 2 &&
          c.participants.some(
            (p: ChatParticipants) => p.id === selectedThreadId,
          ),
      );
      return oneToOne?.id;
    }
    return selectedThreadId;
  }, [selectedThreadId, isIndividualThread, chatsData?.data]);

  const { data: selectedChatData } = useGetChatByIdQuery(
    chatIdToFetch
      ? { id: chatIdToFetch, message_limit: MESSAGE_PAGE_SIZE }
      : { id: "" },
    { skip: !chatIdToFetch },
  );
  const [fetchMoreMessages] = useLazyGetChatByIdQuery();

  useEffect(() => {
    if (!chatsData?.data || !user?.id) return;
    const oneToOneChats = (chatsData.data as Chat[]).filter(
      (c) => !c.type && c.participants && c.participants.length === 2,
    );
    const threads: MessageThread[] = oneToOneChats.map((chat) => {
      const other = (chat.participants as ChatParticipants[]).find(
        (p) => p.id !== user.id,
      );
      return {
        id: other?.id ?? chat.id,
        name: other
          ? `${other.first_name ?? ""} ${other.last_name ?? ""}`.trim() ||
            other.username ||
            "Unknown"
          : "Unknown",
        description: "",
        type: "individual" as const,
      };
    });
    setIndividualThreads(threads);
  }, [chatsData?.data, user?.id]);

  useEffect(() => {
    if (!chatIdToFetch || !selectedChatData?.data?.id) return;
    if (selectedChatData.data.id !== chatIdToFetch) return;
    const { messages: msgs, has_more_messages: hasMore } =
      selectedChatData.data;
    setAccumulatedMessages((prev) => {
      const existing = prev[chatIdToFetch];
      if (existing && existing.messages.length > 0) return prev;
      return {
        ...prev,
        [chatIdToFetch]: {
          messages: msgs ?? [],
          hasMore: hasMore ?? false,
        },
      };
    });
  }, [
    chatIdToFetch,
    selectedChatData?.data?.id,
    selectedChatData?.data?.messages,
    selectedChatData?.data?.has_more_messages,
  ]);

  const [sendChat] = useSendChatMutation();

  // Parent: General only (no Academic)
  const staticThreads: MessageThread[] = [
    {
      id: "general",
      name: "General Conversation",
      description: "Messages for the whole school community.",
      icon: SharedDriveIcon,
      type: "general",
    },
  ];

  const threads: MessageThread[] = useMemo(
    () => [...staticThreads, ...individualThreads],
    [individualThreads],
  );

  const handleContactSelect = (contactId: string) => {
    const contact = contactsData?.data?.find((t) => t.id === contactId);
    if (!contact) return;

    const existing = individualThreads.find((t) => t.id === contactId);
    if (existing) {
      setSelectedThreadId(contactId);
      return;
    }

    const newThread: MessageThread = {
      id: contact.id,
      name:
        `${contact.first_name ?? ""} ${contact.last_name ?? ""}`.trim() ||
        contact.email ||
        "Unknown",
      description: contact.email || "",
      type: "individual",
    };

    setIndividualThreads((prev) => [...prev, newThread]);
    setSelectedThreadId(contactId);
  };

  const rawMessagesForThread = useMemo(() => {
    if (selectedThreadId === "general") {
      if (
        chatIdToFetch &&
        accumulatedMessages[chatIdToFetch]?.messages?.length
      ) {
        return accumulatedMessages[chatIdToFetch].messages;
      }
      if (
        chatIdToFetch &&
        selectedChatData?.data?.id === chatIdToFetch &&
        selectedChatData?.data?.messages?.length
      ) {
        return selectedChatData.data.messages;
      }
      return staticThreadMessages.general;
    }
    if (isIndividualThread && selectedThreadId) {
      if (
        chatIdToFetch &&
        accumulatedMessages[chatIdToFetch]?.messages?.length
      ) {
        return accumulatedMessages[chatIdToFetch].messages;
      }
      if (
        chatIdToFetch &&
        selectedChatData?.data?.id === chatIdToFetch &&
        selectedChatData?.data?.messages?.length
      ) {
        return selectedChatData.data.messages;
      }
      return individualThreadMessages[selectedThreadId] ?? [];
    }
    if (chatIdToFetch && accumulatedMessages[chatIdToFetch]) {
      return accumulatedMessages[chatIdToFetch].messages;
    }
    return selectedChatData?.data?.messages ?? [];
  }, [
    chatIdToFetch,
    accumulatedMessages,
    selectedThreadId,
    staticThreadMessages,
    individualThreadMessages,
    isIndividualThread,
    selectedChatData?.data?.id,
    selectedChatData?.data?.messages,
  ]);

  const hasMoreFromApi =
    selectedChatData?.data?.id === chatIdToFetch &&
    (selectedChatData?.data?.has_more_messages ?? false);
  const hasMoreMessages =
    !!chatIdToFetch &&
    (accumulatedMessages[chatIdToFetch]?.hasMore ?? hasMoreFromApi);

  const messages: Message[] = useMemo(() => {
    return rawMessagesForThread.map((msg: ChatMessages) => {
      const isOwnMessage = msg.sender?.id === user?.id;
      return {
        id: msg.id,
        senderName: msg.sender
          ? `${msg.sender.first_name ?? ""} ${msg.sender.last_name ?? ""}`.trim() ||
            msg.sender.username ||
            "Unknown"
          : "Unknown",
        senderEmail: msg.sender?.username || "",
        message: msg.content,
        timestamp: msg.created_at
          ? format(new Date(msg.created_at), "M/d/yyyy, h:mm:ss a")
          : "",
        isOwnMessage,
      };
    });
  }, [rawMessagesForThread, user]);

  const selectedThread = threads.find((t) => t.id === selectedThreadId);

  const handleSendMessage = async (message: string) => {
    if (!selectedThreadId || !message.trim()) return;

    const isGeneral = selectedThreadId === "general";
    const chatType = isGeneral ? "general" : undefined;

    const sourceMessages = rawMessagesForThread;
    const history = sourceMessages.map((msg: ChatMessages) => ({
      role: msg.role,
      message: msg.content,
      model_type: msg.model_type ?? "",
    }));

    try {
      const payload: SendChatPayload = {
        message: message.trim(),
        history,
        content_type: "text/plain",
        save_chat: true,
      };
      if (chatType) {
        payload.type = chatType;
        if (user?.school_id) payload.school_id = user.school_id;
      }
      if (isIndividualThread && selectedThreadId) {
        payload.recipient_id = String(selectedThreadId);
      }
      if (!isGeneral && chatIdToFetch) {
        payload.id = chatIdToFetch;
      } else if (!isGeneral && selectedThreadId) {
        payload.id = selectedThreadId;
      }

      const result = await sendChat(payload).unwrap();
      if (chatIdToFetch && result?.data?.messages) {
        setAccumulatedMessages((prev) => ({
          ...prev,
          [chatIdToFetch]: {
            messages: result.data.messages ?? [],
            hasMore: prev[chatIdToFetch]?.hasMore ?? false,
          },
        }));
      }
      if (isGeneral && result?.data?.messages && !chatIdToFetch) {
        setStaticThreadMessages((prev) => ({
          ...prev,
          general: result.data.messages ?? [],
        }));
      }
      if (isIndividualThread && selectedThreadId && result?.data?.messages) {
        const msgs = result.data.messages ?? [];
        setIndividualThreadMessages((prev) => ({
          ...prev,
          [selectedThreadId]: msgs,
        }));
        if (result.data.id) {
          setAccumulatedMessages((prev) => ({
            ...prev,
            [result.data.id]: {
              messages: msgs,
              hasMore: result.data.has_more_messages ?? false,
            },
          }));
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleLoadPrevious = async () => {
    if (!chatIdToFetch || !hasMoreMessages) return;
    const current = accumulatedMessages[chatIdToFetch];
    const oldestId =
      current?.messages[0]?.id ??
      (selectedChatData?.data?.id === chatIdToFetch
        ? selectedChatData?.data?.messages?.[0]?.id
        : undefined);
    if (!oldestId) return;
    try {
      const result = await fetchMoreMessages({
        id: chatIdToFetch,
        message_limit: MESSAGE_PAGE_SIZE,
        message_before: oldestId,
      }).unwrap();
      const older = result?.data?.messages ?? [];
      const hasMore = result?.data?.has_more_messages ?? false;
      if (older.length > 0) {
        setAccumulatedMessages((prev) => ({
          ...prev,
          [chatIdToFetch]: {
            messages: [...older, ...(prev[chatIdToFetch]?.messages ?? [])],
            hasMore,
          },
        }));
      } else {
        setAccumulatedMessages((prev) => ({
          ...prev,
          [chatIdToFetch]: {
            ...prev[chatIdToFetch]!,
            hasMore: false,
          },
        }));
      }
    } catch (e) {
      console.error("Load previous failed:", e);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-background rounded-md p-6">
        <h2 className="text-2xl font-bold text-gray-800">Messages</h2>
        <p className="text-gray-600 mt-1">
          Communicate with school staff and teachers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <MessageThreadsList
          threads={threads}
          selectedThreadId={selectedThreadId}
          onThreadSelect={setSelectedThreadId}
          onNewMessage={() => {}}
          teachers={contactsData?.data ?? []}
          onTeacherSelect={handleContactSelect}
        />

        <div className="lg:col-span-2 flex flex-col">
          {selectedThread ? (
            <div className="flex flex-col gap-4">
              <ChatHeader
                title={`${selectedThread.name}.`}
                subtitle={selectedThread.description}
                type={selectedThread.type}
              />

              <ChatConversation
                messages={messages}
                onSendMessage={() => {}}
                onLoadPrevious={
                  hasMoreMessages ? handleLoadPrevious : undefined
                }
              />

              <MessageInput onSend={handleSendMessage} />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white rounded-md">
              <div className="text-center p-6">
                <Icon
                  icon={MessageCancel01Icon}
                  size={48}
                  className="mx-auto text-gray-400 mb-4"
                />
                <p className="text-base text-gray-600">
                  Select a conversation to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
