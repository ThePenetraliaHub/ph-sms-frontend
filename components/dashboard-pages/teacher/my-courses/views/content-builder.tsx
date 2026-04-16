import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputField, SelectField } from "@/components/ui/input-field";
import { Label } from "@/components/ui/label";
import { SelectItem } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

interface Question {
  questionModel: string;
  questionInstruction: string;
  question: string;
  answerOptions: string[];
  correctAnswer: string;
  scoreMark: number | string;
}

const initialData: Question = {
  questionModel: "",
  questionInstruction: "",
  question: "",
  answerOptions: [""] as string[],
  correctAnswer: "",
  scoreMark: "",
};

export default function ContentBuilder() {
  const [question, setQuestion] = useState<Question>(initialData);

  const handleOptionsChange = (index: number, value: string) => {
    const newOption = [...question.answerOptions];
    newOption[index] = value;
    setQuestion((prev) => ({
      ...prev,
      answerOptions: newOption,
    }));
  };

  const handleAddOption = () => {
    setQuestion((prev) => ({
      ...prev,
      answerOptions: [...prev.answerOptions, ""],
    }));
  };

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
      {/* select question model */}
      <SelectField
        label="Select Question Model"
        //   value={newResource.courseAssigned}
        //   onValueChange={(e) => {
        //     setNewResource((prevState) => {
        //       return {
        //         ...prevState,
        //         courseAssigned: e,
        //       };
        //     });
        //   }}
        onValueChange={() => {}}
        placeholder="Select Model"
      >
        {["Multiple Choice", "True/False", "Fill in the blank"].map(
          (option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ),
        )}
      </SelectField>
      {/* question instructions */}
      <InputField
        type="text"
        label="Question Instruction"
        required
        placeholder=""
      />
      {/* question */}
      <InputField type="text" label="Question" required placeholder="" />
      {/* answer options */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-800">
          Answer Options
        </label>
        {question.answerOptions.map((option, idx) => {
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
      {/* correct answer */}
      <InputField
        type="text"
        label="Correct Answer"
        className="placeholder:text-sm"
        required
        placeholder="Number Input"
      />
      {/* score marks */}
      <InputField
        type="text"
        label="Score Marks"
        className="placeholder:text-sm"
        required
        placeholder="Number Input (e.g., 2)"
      />
      {/* view question listings & add another questions btn */}
      <div className="flex items-center gap-x-3 w-full mt-3">
        <Button className="w-1/2 h-12" variant="outline">
          View Question Listings
        </Button>
        <Button className="w-1/2 h-12" variant="outline">
          + Add Another Question
        </Button>
      </div>
      {/* action btns */}
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline">Save as Draft</Button>
        <Button
          className="w-60"
          // onClick={onSaveAndSelectQuestions}
          // disabled={isLoading}
        >
          {/* {isLoading ? "Creating…" : "Save & Select Questions"} */}
          Save & Publish to Students
        </Button>
      </div>
    </div>
  );
}
