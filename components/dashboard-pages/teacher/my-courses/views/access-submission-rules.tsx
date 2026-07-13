import { SelectItem } from "@/components/ui/select";
import { InputField, SelectField } from "@/components/ui/input-field";
import { Button } from "@/components/ui/button";
import {
  QuestionBuilder,
  StepId,
} from "@/app/(dashboard)/teacher/my-courses/create-new-questions/page";

interface Props {
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  question: QuestionBuilder;
  setQuestion: React.Dispatch<React.SetStateAction<QuestionBuilder>>;
  setCurrentStep: React.Dispatch<React.SetStateAction<StepId>>;
}

export default function AccessSubmissionRules({
  handleChange,
  question,
  setQuestion,
  setCurrentStep,
}: Props) {
  const showResultsOps: string[] = ["never", "immediately", "after due date"];

  const handleNext = () => {
    setCurrentStep("content-builder");
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">
        Access & Submission Rules
      </h2>
      <div className="space-y-6 w-full mt-5">
        {/* time limit */}
        <InputField
          label="Time Limit (Quizzes Only)"
          required
          onChange={handleChange}
          value={question.timeLimit}
          name="timeLimit"
          type="number"
          placeholder="Placeholder"
        />
        {/* submission attempts */}
        <InputField
          label="Submission Attempts"
          required
          onChange={handleChange}
          value={question.submissionAttempts}
          name="submissionAttempts"
          type="number"
          placeholder="Placeholder"
        />
        {/* show results to students */}
        <SelectField
          label="Show results to students"
          value={question.showResultsToStudents}
          onValueChange={(value) => {
            setQuestion((prev) => ({ ...prev, showResultsToStudents: value }));
          }}
          placeholder="Select Option"
        >
          {showResultsOps.map((option) => (
            <SelectItem className="capitalize" key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectField>
        {/* Shuffle questions */}
        <SelectField
          label="Shuffle Questions"
          value={question.question_shuffle}
          onValueChange={(value) => {
            setQuestion((prev) => ({ ...prev, question_shuffle: value }));
          }}
          placeholder="Select Option"
        >
          {["yes", "no"].map((option) => (
            <SelectItem className="capitalize" key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectField>
        {/* Shuffle Answer */}
        <SelectField
          label="Shuffle Answers"
          value={question.answer_shuffle}
          onValueChange={(value) => {
            setQuestion((prev) => ({ ...prev, answer_shuffle: value }));
          }}
          placeholder="Select Option"
        >
          {["yes", "no"].map((option) => (
            <SelectItem className="capitalize" key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectField>
        {/* action btns */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline">Back</Button>
          <Button className="w-60" onClick={handleNext}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
