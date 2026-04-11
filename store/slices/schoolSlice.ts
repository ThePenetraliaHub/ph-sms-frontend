import { createSlice } from "@reduxjs/toolkit";
import { schoolsApi } from "@/services/schools/schools";
import type { School, Term } from "@/services/schools/schools-type";

interface SchoolState {
  currentSchool: School | null;
}

const initialState: SchoolState = {
  currentSchool: null,
};

export const schoolSlice = createSlice({
  name: "school",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      schoolsApi.endpoints.getSchoolById.matchFulfilled,
      (state, action) => {
        state.currentSchool = action.payload.data;
      },
    );
  },
});

export default schoolSlice.reducer;

// Inline state type to avoid circular dependency with store/index.ts
type SchoolRootState = { school: SchoolState };

export const selectCurrentSchool = (state: SchoolRootState): School | null =>
  state.school.currentSchool;

export const selectClasses = (state: SchoolRootState): string[] =>
  state.school.currentSchool?.classes ?? [];

export const selectSubjects = (state: SchoolRootState): string[] =>
  state.school.currentSchool?.subjects ?? [];

export const selectTerm = (state: SchoolRootState): Term | null =>
  state.school.currentSchool?.term ?? null;

export const selectSchoolName = (state: SchoolRootState): string =>
  state.school.currentSchool?.name ?? "";

export const selectSchoolID = (state: SchoolRootState): string =>
  state.school.currentSchool?.id ?? "";

export const selectSchoolDays = (state: SchoolRootState): string[] =>
  state.school.currentSchool?.school_days ?? [];
