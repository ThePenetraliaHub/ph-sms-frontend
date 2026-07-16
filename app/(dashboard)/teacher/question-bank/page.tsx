"use client";

import { useMemo, useState } from "react";
import { MetricCard } from "@/components/dashboard-pages/admin/admissions/components/metric-card";
import { usePagination } from "@/hooks/use-pagination";
import {
  DataTable,
  TableColumn,
  TableAction,
} from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Icon } from "@/components/general/huge-icon";
import { AddSquareIcon } from "@hugeicons/core-free-icons";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { CreateQuestionModal } from "@/components/dashboard-pages/teacher/question-bank/create-question-modal";
import {
  useDeleteCbtQuestionMutation,
  useGetCbtQuestionsQuery,
} from "@/services/cbt-questions/cbt-questions";
import { CbtQuestion } from "@/services/cbt-questions/cbt-question-types";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/authSlice";
import { Pagination } from "@/common/types";
import { getStatusColor } from "@/utils/helpers";
import { toast } from "sonner";

interface Question {
  id: string;
  questionSnippet: string;
  subjectTopic: string;
  class: string;
  status: "appproved" | "pending" | "draft" | "rejected";
}

export default function QuestionBankPage() {
  const user = useAppSelector(selectUser);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [pagination, setPagination] = useState<Pagination>();

  //get all questions
  const {
    data: all_questions,
    isLoading: isFetchingQuestions,
    isError: isFetchingQuestionsErr,
  } = useGetCbtQuestionsQuery();

  const [deleteCbtQuestion, { isLoading: isDeletingCbtQuestion }] =
    useDeleteCbtQuestionMutation();

  //delete question
  const eliminateQuestion = async (id: string) => {
    try {
      //RETURNS PERMISSION ERR
      // const res = await deleteCbtQuestion(id);
      // toast.success("Question successfully deleted!")
      await deleteCbtQuestion(id);
    } catch (err) {
      console.error(err);
    }
  };

  //save to state
  const myQuestions: CbtQuestion[] = useMemo(() => {
    if (!all_questions) return [];
    //filter by ID
    const my_questions = all_questions.data.filter(
      (quest) => quest.creator?.id === user?.id,
    );
    //set pagination
    setPagination(all_questions.pagination);
    return my_questions;
  }, [all_questions]);

  const filteredQuestions = myQuestions.filter((question) => {
    const matchesSearch =
      !searchQuery ||
      question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      question?.status?.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const {
    displayedData: questions,
    hasMore,
    loadMore,
  } = usePagination({
    data: filteredQuestions,
    initialItemsPerPage: 4,
    itemsPerPage: 4,
  });

  const columns: TableColumn<CbtQuestion>[] = [
    {
      key: "question",
      title: "Question",
      render: (value) => (
        <span className="font-medium text-gray-800">{value as string}</span>
      ),
    },
    {
      key: "category",
      title: "Category",
      render: (value) => (
        <span className="text-gray-700 capitalize">{value as string}</span>
      ),
    },
    {
      key: "correct_answer",
      title: "Correct Answer",
      render: (value) => (
        <span className="text-gray-700">{value as string}</span>
      ),
    },
    {
      key: "type",
      title: "Type",
      render: (value) => (
        <span className="text-gray-700">{value as string}</span>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (value) => {
        const status = value as "approved" | "pending" | "draft" | "rejected";
        return (
          <span
            className={cn(
              "text-sm font-medium capitalize",
              getStatusColor(status),
            )}
          >
            {status}
          </span>
        );
      },
    },
  ];

  const actions: TableAction<CbtQuestion>[] = [
    {
      type: "dropdown",
      config: {
        items: [
          {
            label: "View Details",
            onClick: (row) => {
              console.log("View details for:", row.id);
            },
          },
          {
            label: "Edit Question",
            onClick: (row) => {
              console.log("Edit question:", row.id);
            },
            separator: true,
          },
          {
            label: "Delete Question",
            onClick: (row) => {
              eliminateQuestion(row.id);
            },
            variant: "destructive",
          },
        ],
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-background rounded-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Question Bank (Teacher Workflow)
        </h1>
        <p className="text-gray-600">
          This screen allows the teacher to manage, create, and submit new
          assessment questions to the central repository for review and
          potential use in CBTs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard
          title="Total Questions Created"
          value={`${myQuestions.length} Questions`}
          trend="up"
          trendColor="text-main-blue"
        />
        <MetricCard
          title="Pending Approval"
          value={`${myQuestions.filter((question) => question.status === "pending").length} Questions`}
          trend="up"
          trendColor="text-main-blue"
        />
      </div>

      <Button
        variant={"outline"}
        className="w-full h-11 flex items-center gap-2"
        onClick={() => setCreateModalOpen(true)}
      >
        <Icon icon={AddSquareIcon} size={18} />
        Create New Question
      </Button>

      <div className="bg-background rounded-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            My Question Bank Table
          </h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search by e.g., Kinetic Energy"
                className="pl-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter: Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <DataTable
            columns={columns}
            data={questions}
            isLoading={isFetchingQuestions || isDeletingCbtQuestion}
            emptyMessage={
              isFetchingQuestionsErr
                ? "Failed to fetch questions"
                : "No data available"
            }
            actions={actions}
            showActionsColumn={true}
            actionsColumnTitle="Action"
          />
        </div>

        {hasMore && (
          <div className="flex justify-center mt-4">
            <Button variant="outline" onClick={loadMore}>
              Load More
            </Button>
          </div>
        )}
      </div>

      <CreateQuestionModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
      />
    </div>
  );
}
