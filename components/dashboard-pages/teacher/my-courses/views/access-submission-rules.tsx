import { SelectItem } from "@/components/ui/select";
import { InputField, SelectField } from "@/components/ui/input-field";
import { Button } from "@/components/ui/button";

export default function AccessSubmissionRules() {
  const showResultsOps: string[] = ["never", "immediately", "after due date"];
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
          type="number"
          placeholder="Placeholder"
        />
        {/* submission attempts */}
        <InputField
          label="Submission Attempts"
          required
          type="number"
          placeholder="Placeholder"
        />
        {/* show results to students */}
        <SelectField
          label="Assign to Course"
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
          placeholder="Select Option"
        >
          {showResultsOps.map((option) => (
            <SelectItem className="capitalize" key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectField>
        {/* action btns */}
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline">Back</Button>
          <Button
            className="w-60"
            // onClick={onSaveAndSelectQuestions}
            // disabled={isLoading}
          >
            {/* {isLoading ? "Creating…" : "Save & Select Questions"} */}
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
