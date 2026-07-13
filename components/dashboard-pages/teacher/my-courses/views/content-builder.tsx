import {
  QuestionBuilder,
  QuestionModel,
} from "@/app/(dashboard)/teacher/my-courses/create-new-questions/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputField, SelectField } from "@/components/ui/input-field";
import { Label } from "@/components/ui/label";
import { SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export interface Question {
  type: QuestionModel;
  explanation: string;
  question: string;
  answer_options: string[];
  correct_answer: string | number;
  topic_covered: string | number;
  subject: string;
  instruction: string;
}

const initialData: Question = {
  type: "multiple_choice",
  explanation: "",
  question: "",
  answer_options: [""] as string[],
  correct_answer: "", //NUMBER
  subject: "",
  topic_covered: "", //NUMBER
  instruction: "",
};

export interface Props {
  updateQuestion: React.Dispatch<React.SetStateAction<QuestionBuilder>>;
  isLoading: boolean;
  submit: (questionStatus: "published" | "draft") => Promise<string | number | undefined>
}

export default function ContentBuilder({
  updateQuestion,
  isLoading,
  submit,
}: Props) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [question, setQuestion] = useState<Question>(initialData);

  const handleOptionsChange = (index: number, value: string) => {
    const newOption = [...question.answer_options];
    newOption[index] = value;
    setQuestion((prev) => ({
      ...prev,
      answer_options: newOption,
    }));
  };

  const handleAddOption = () => {
    setQuestion((prev) => ({
      ...prev,
      answer_options: [...prev.answer_options, ""],
    }));
  };

  const handleAddQuestion = () => {
    if (
      !question.instruction.trim() ||
      !question.question.trim() ||
      question.answer_options.length === 0 ||
      !question.explanation.trim()
    )
      return toast.error("Please fill all fields");
    if (
      isNaN(Number(question.correct_answer)) ||
      isNaN(Number(question.topic_covered))
    )
      return toast.error(
        "'Correct Answer', 'Topics Covered' can only be numbers",
      );
    setQuestions((prev) => [
      ...prev,
      {
        ...question,
        correct_answer: Number(question.correct_answer),
        topic_covered: Number(question.topic_covered),
      },
    ]);
    setQuestion(initialData);
    toast.success("Question added to list");
  };

  useEffect(() => {
    updateQuestion((prev) => ({ ...prev, all_questions: questions }));
  }, [questions]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">Content Builder</h2>
      <div className="flex flex-col gap-y-4">
        <Label>Add questions from Question Bank</Label>
        <Button className="h-11" variant={"outline"}>
          + Add Questions
        </Button>
      </div>
      <Separator />
      {/* question instructions */}
      <InputField
        type="text"
        label="Question Instructions"
        required
        onChange={(e) =>
          setQuestion((prev) => ({
            ...prev,
            instruction: e.target.value,
          }))
        }
        value={question.instruction}
        placeholder="E.g. Choose the right answer carefully"
      />
      {/* question */}
      <InputField
        onChange={(e) =>
          setQuestion((prev) => ({
            ...prev,
            question: e.target.value,
          }))
        }
        value={question.question}
        type="text"
        label="Question"
        required
        placeholder="E.g. What is photosynthesis?"
      />
      {/* answer options */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-800">
          Answer Options
        </label>
        {question.answer_options.map((option, idx) => {
          return (
            <Input
              onChange={(e) => handleOptionsChange(idx, e.target.value)}
              key={idx}
              placeholder="Add Option"
              value={option}
              className="placeholder:text-sm"
            />
          );
        })}
        {/* add answer */}
        <div className="flex justify-end">
          <Button
            className="p-5"
            variant="outline"
            size="sm"
            onClick={handleAddOption}
          >
            Add Another Option
          </Button>
        </div>
      </div>
      {/* select question model */}
      <SelectField
        label="Select Question Model *"
        value={question.type}
        onValueChange={(value) =>
          setQuestion((prev) => ({
            ...prev,
            type: value as QuestionModel,
          }))
        }
        placeholder="Select Model"
      >
        {[
          { name: "Multiple Choice", id: "multiple_choice" },
          { name: "True/False", id: "true/false" },
          { name: "Fill in the blank", id: "fill_in_the_blank" },
        ].map((option, index) => (
          <SelectItem key={index} value={option.id}>
            {option.name}
          </SelectItem>
        ))}
      </SelectField>
      {/* correct answer */}
      <InputField
        type="text"
        label="Correct Answer"
        className="placeholder:text-sm"
        required
        placeholder="Number Input e.g. 1"
        onChange={(e) =>
          setQuestion((prev) => ({
            ...prev,
            correct_answer: e.target.value,
          }))
        }
        value={question.correct_answer}
      />
      {/* question explanation */}
      <InputField
        type="text"
        label="Question Explanation"
        required
        onChange={(e) =>
          setQuestion((prev) => ({
            ...prev,
            explanation: e.target.value,
          }))
        }
        value={question.explanation}
        placeholder="E.g. Ensure you choose the right answer"
      />
      {/* score marks */}
      <InputField
        type="text"
        label="Topics Covered"
        className="placeholder:text-sm"
        onChange={(e) =>
          setQuestion((prev) => ({
            ...prev,
            topic_covered: e.target.value,
          }))
        }
        value={question.topic_covered}
        required
        placeholder="Number Input e.g. 2"
      />
      {/* view question listings & add another questions btn */}
      <div className="flex items-center gap-x-3 w-full mt-3">
        <Button className="w-1/2 h-12" variant="outline">
          View Question Listings
        </Button>
        <Button
          onClick={handleAddQuestion}
          className="w-1/2 h-12"
          variant="outline"
        >
          + Add Question
        </Button>
      </div>
      {/* action btns */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          disabled={isLoading}
          onClick={() => submit("draft")}
          variant="outline"
        >
          {isLoading ? "Saving as draft..." : "Save as Draft"}
        </Button>
        <Button
          disabled={isLoading}
          onClick={() => submit("published")}
          className="w-60 disabled:opacity-50 transition ease-in-out delay-100 opacity-100"
        >
          {isLoading ? "Saving..." : "Save & Publish to Students"}
        </Button>
      </div>
    </div>
  );
}
