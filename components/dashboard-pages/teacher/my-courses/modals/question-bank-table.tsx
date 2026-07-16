"use client";
import { Button } from "@/components/ui/button";
import { DataTable, TableColumn } from "@/components/ui/data-table";
import { ModalContainer } from "@/components/ui/modal-container";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";
import { usePagination } from "@/hooks/use-pagination";
import { useGetCbtQuestionsQuery } from "@/services/cbt-questions/cbt-questions";
import { CbtQuestion } from "@/services/cbt-questions/cbt-question-types";
import { Pagination } from "@/common/types";
import { cn } from "@/lib/utils";
import { getStatusColor } from "@/utils/helpers";
import { Checkbox } from "@/components/ui/checkbox";
import {
  QuestionBuilder,
  QuestionModel,
} from "@/app/(dashboard)/teacher/my-courses/create-new-questions/page";
import { CheckedState } from "@radix-ui/react-checkbox";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  setQuestion: React.Dispatch<React.SetStateAction<QuestionBuilder>>;
  question: QuestionBuilder;
}

export default function QuestionBankTable({
  onOpenChange,
  open,
  userId,
  setQuestion,
  question,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState<Pagination>();
  const [statusFilter, setStatusFilter] = useState<string>("all");

  //get all questions
  const {
    data: all_questions,
    isLoading: isFetchingQuestions,
    isError: isFetchingQuestionsErr,
  } = useGetCbtQuestionsQuery();

  //save to state
  const myQuestions: CbtQuestion[] = useMemo(() => {
    if (!all_questions) return [];
    //filter by ID
    const my_questions = all_questions.data.filter(
      (quest) => quest.creator?.id === userId,
    );
    //set pagination
    setPagination(all_questions.pagination);
    return my_questions;
  }, [all_questions]);

  //handle modal close
  const handleCancel = () => {
    onOpenChange(false);
  };

  //add/remove question from list
  const toggleQuestionToArr = (
    selectedQuestion: CbtQuestion,
    checked: CheckedState,
  ) => {
    if (!checked) {
      setQuestion((prev) => ({
        ...prev,
        question_ids: prev.question_ids.filter(
          (item) => item !== selectedQuestion.id,
        ),
        all_questions: prev.all_questions.filter(
          (item) => item.question !== selectedQuestion.question,
        ),
      }));
      toast.success("Question removed from list");
      return;
    }

    //add question to list
    setQuestion((prev) => ({
      ...prev,
      question_ids: [...prev.question_ids, selectedQuestion.id],
      all_questions: [
        ...prev.all_questions,
        {
          type: selectedQuestion.type as QuestionModel,
          explanation: selectedQuestion.explanation ?? "",
          question: selectedQuestion.question ?? "",
          answer_options: selectedQuestion.answer_options ?? "",
          correct_answer: selectedQuestion.correct_answer ?? "",
          topic_covered: selectedQuestion.topic_covered ?? "",
          subject: selectedQuestion.subject ?? "",
          instruction: selectedQuestion.instruction ?? "",
        },
      ],
    }));
    toast.success("Question added to list");
  };

  //resolve checked state
  const checkQuestion = (id: string): boolean => {
    const ques = question.question_ids.some((item) => item === id);
    if (ques) return true;
    return false;
  };

  //handle question addition
  const columns: TableColumn<CbtQuestion>[] = [
    {
      key: "",
      title: "",
      render: (value, row) => (
        <span className="text-gray-700">
          <Checkbox
            onCheckedChange={(checked) => toggleQuestionToArr(row, checked)}
            checked={checkQuestion(row.id)}
          />
        </span>
      ),
    },
    {
      key: "question",
      title: "Question Snippet",
      render: (value) => (
        <span className="text-gray-700">{value as string}</span>
      ),
    },
    {
      key: "subject",
      title: "Subject/Topic",
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
      render: (value) => (
        <span className={cn("text-sm capitalize", getStatusColor(value))}>
          {value as string}
        </span>
      ),
    },
    // {
    //   key: "action",
    //   title: "Action",
    //   render: (value, row) => {
    //     return (
    //       <div className="flex items-center gap-3">
    //         <p
    //           //   onClick={() => removeQuestion(row.question)}
    //           className="text-destructive hover:underline text-sm font-medium cursor-pointer"
    //         >
    //           Remove
    //         </p>
    //       </div>
    //     );
    //   },
    // },
  ];

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

  return (
    <ModalContainer
      open={open}
      title={"My Question Bank Table"}
      onOpenChange={handleCancel}
      className="max-h-[400px] overflow-y-scroll"
      size="3xl"
      footer={
        <div className="grid grid-cols-1 gap-3 w-full">
          <Button className="h-9" variant={"outline"} onClick={handleCancel}>
            Close
          </Button>
        </div>
      }
    >
      <p className="text-sm text-muted-foreground">
        Click as many as you want to add
      </p>
      <div className="flex items-center gap-3">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="search"
            placeholder="Search by e.g., Kinetic Energy"
            className="pl-10 w-full"
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
      {/* data table */}
      <div className="border rounded-lg overflow-hidden">
        <DataTable
          columns={columns}
          data={questions}
          //   showActionsColumn={false}
          //   itemsPerPage={3}
          isLoading={isFetchingQuestions}
          emptyMessage={
            isFetchingQuestionsErr
              ? "Failed to load question"
              : "You've not registered any question yet"
          }
        />
      </div>
      {/* load more button */}
      {hasMore && (
        <div className="flex justify-center mt-4">
          <Button variant="outline" onClick={loadMore}>
            Load More
          </Button>
        </div>
      )}
    </ModalContainer>
  );
}
