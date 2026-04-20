import type {
  CreateSchoolRequest,
  UpdateSchoolRequest,
  School,
  SchoolColor,
  SchoolLogo,
  Term,
  Bank,
  Break,
} from "@/services/schools/schools-type";

const DEFAULT_BANK: Bank = {
  bank_id: "",
  bank_code: "",
  bank_name: "",
  account_name: "",
  account_number: "",
};

type SchoolWithUpdateExtras = School & {
  grading_scales_config?: UpdateSchoolRequest["grading_scales_config"];
  academic_calendar_config?: UpdateSchoolRequest["academic_calendar_config"];
  daily_reconciliation?: UpdateSchoolRequest["daily_reconciliation"];
  max_single_transaction?: UpdateSchoolRequest["max_single_transaction"];
  low_stock_threshold?: UpdateSchoolRequest["low_stock_threshold"];
};

function pickSchoolUpdateExtensionFields(
  school: School,
): Pick<
  UpdateSchoolRequest,
  | "grading_scales_config"
  | "academic_calendar_config"
  | "discount_rules"
  | "daily_reconciliation"
  | "max_single_transaction"
  | "low_stock_threshold"
> {
  const s = school as SchoolWithUpdateExtras;
  const discountRules =
    s.discount_rules && s.discount_rules.length > 0
      ? s.discount_rules
      : (school.discount_rules ?? []);

  return {
    grading_scales_config: s.grading_scales_config ?? [],
    academic_calendar_config: s.academic_calendar_config ?? {
      name: "",
      end_date: "",
      start_date: "",
      no_of_terms: 0,
      holidays_or_breaks: {
        name: "",
        time_in: "",
        end_date: "",
        time_out: "",
        start_date: "",
      },
    },
    discount_rules: discountRules,
    daily_reconciliation: (s.daily_reconciliation ??
      false) as UpdateSchoolRequest["daily_reconciliation"],
    max_single_transaction: s.max_single_transaction ?? "",
    low_stock_threshold: s.low_stock_threshold ?? 0,
  };
}

export interface IdentityState {
  schoolName: string;
  address: string;
  primaryEmail: string;
  countryCode: string;
  contactPhone: string;
  schoolType: string;
  establishedDate: string;
  accreditationNumber: string;
  licenseNumber: string;
  websiteDomain: string;
  defaultTerms: string;
  academicSession: string;
}

export interface BrandingState {
  primaryLogoFile: File | null;
  secondaryLogoFile: File | null;
  primaryColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  loginBackgroundFile: File | null;
  eSignatureFile: File | null;
}

export interface SubscriptionState {
  plan: string;
  subscription_id: string;
  modules: Record<string, boolean>;
  studentLimit: string;
  staffLimit: string;
  storageLimit: string;
  paymentGateway: string;
}

export interface AddSchoolFormState {
  identity: IdentityState;
  branding: BrandingState;
  subscription: SubscriptionState;
}

export const MODULE_IDS = [
  "academic_management",
  "cbt_management",
  "timetabling",
  "learning_management",
  "assessment",
  "wallet",
] as const;

export const getInitialIdentityState = (): IdentityState => ({
  schoolName: "",
  address: "",
  primaryEmail: "",
  countryCode: "+234",
  contactPhone: "",
  schoolType: "",
  establishedDate: "",
  accreditationNumber: "",
  licenseNumber: "",
  websiteDomain: "",
  defaultTerms: "3",
  academicSession: "",
});

export const getInitialBrandingState = (): BrandingState => ({
  primaryLogoFile: null,
  secondaryLogoFile: null,
  primaryColor: "#6366f1",
  secondaryColor: "#8b5cf6",
  tertiaryColor: "#a855f7",
  loginBackgroundFile: null,
  eSignatureFile: null,
});

export const getInitialSubscriptionState = (): SubscriptionState => ({
  plan: "",
  subscription_id: "",
  modules: MODULE_IDS.reduce(
    (acc, id) => ({ ...acc, [id]: false }),
    {} as Record<string, boolean>,
  ),
  studentLimit: "",
  staffLimit: "",
  storageLimit: "",
  paymentGateway: "",
});

export function getInitialAddSchoolFormState(): AddSchoolFormState {
  return {
    identity: getInitialIdentityState(),
    branding: getInitialBrandingState(),
    subscription: getInitialSubscriptionState(),
  };
}

function defaultTerm(session: string, termsCount: string): Term {
  const [startYear] = session.split("/").map((s) => s.trim());
  const y = startYear ? parseInt(startYear, 10) : new Date().getFullYear();
  const numTerms = Math.max(1, parseInt(termsCount, 10) || 3);
  const start = new Date(y, 0, 1);
  const end = new Date(y + 1, 5, 30);
  return {
    name: `${numTerms} Terms`,
    session: session || `${y}/${y + 1}`,
    start_date: start.toISOString().slice(0, 10),
    end_date: end.toISOString().slice(0, 10),
  };
}

export function buildCreateSchoolPayload(
  state: AddSchoolFormState,
  primaryLogoUrl: string | null,
  primaryLogoPublicId: string | null,
): CreateSchoolRequest {
  const { identity, branding, subscription } = state;
  const phone =
    identity.countryCode && identity.contactPhone
      ? `${identity.countryCode}${identity.contactPhone.replace(/\D/g, "")}`
      : undefined;
  const color: SchoolColor = {
    primary: branding.primaryColor || "#6366f1",
    secondary: branding.secondaryColor || "#8b5cf6",
    tertiary: branding.tertiaryColor || "#a855f7",
    accent: branding.primaryColor || "#6366f1",
  };
  const logo: SchoolLogo = {
    svg: "",
    image_url: primaryLogoUrl,
    image_public_id: primaryLogoPublicId,
  };
  const term = defaultTerm(identity.academicSession, identity.defaultTerms);
  const now = new Date().toISOString().slice(0, 10);
  return {
    name: identity.schoolName,
    address: identity.address || undefined,
    email: identity.primaryEmail || undefined,
    phone,
    website: identity.websiteDomain || undefined,
    motto: "",
    type: identity.schoolType || "secondary",
    status: "active",
    established_date: identity.establishedDate || now,
    accreditation_number: identity.accreditationNumber || "",
    license_number: identity.licenseNumber || "",
    student_capacity: parseInt(subscription.studentLimit, 10) || 1000,
    current_enrollment: 0,
    color,
    logo,
    subscription: {
      subscription_id: subscription.subscription_id,
      plan: subscription.plan.toLowerCase(),
      start_date: now,
      end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
      status: "active",
    },
    facebook_url: "",
    twitter_url: "",
    instagram_url: "",
    linkedin_url: "",
    is_active: true,
    term,
  };
}

const COUNTRY_CODES = ["+234", "+233", "+1", "+44", "+91", "+81"];

function normalizeEstablishedDate(value: string | null | undefined): string {
  if (value == null || String(value).trim() === "") return "";
  const s = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  try {
    const d = new Date(s);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

function parsePhone(phone: string | undefined): {
  countryCode: string;
  contactPhone: string;
} {
  if (!phone || !phone.trim()) {
    return { countryCode: "+234", contactPhone: "" };
  }
  const trimmed = phone.trim();
  for (const code of COUNTRY_CODES) {
    if (trimmed.startsWith(code)) {
      return {
        countryCode: code,
        contactPhone: trimmed.slice(code.length).replace(/\D/g, ""),
      };
    }
  }
  return { countryCode: "+234", contactPhone: trimmed.replace(/\D/g, "") };
}

export function schoolToFormState(school: School): AddSchoolFormState {
  const { countryCode, contactPhone } = parsePhone(school.phone);
  const sub = school.subscription_details ?? school.subscription;
  const subscriptionId =
    school.subscription_details?.subscription_id ??
    (school.subscription as { subscription_id?: string } | undefined)
      ?.subscription_id ??
    "";
  const plan =
    school.subscription_details?.subscription?.plan ??
    (school.subscription as { plan?: string } | undefined)?.plan ??
    "";

  const term = school.term ?? {
    name: "3 Terms",
    session: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
    start_date: "",
    end_date: "",
  };
  const [sessionStart] = (term.session ?? "").split("/").map((s) => s.trim());
  const termsMatch = term.name?.match(/\d+/);
  const defaultTerms = termsMatch ? termsMatch[0] : "3";

  return {
    identity: {
      schoolName: school.name ?? "",
      address: school.address ?? "",
      primaryEmail: school.email ?? "",
      countryCode,
      contactPhone,
      schoolType: school.type ?? "secondary",
      establishedDate: normalizeEstablishedDate(school.established_date),
      accreditationNumber: school.accreditation_number ?? "",
      licenseNumber: school.license_number ?? "",
      websiteDomain: school.website ?? "",
      defaultTerms,
      academicSession: sessionStart
        ? `${sessionStart}/${Number(sessionStart) + 1}`
        : "",
    },
    branding: {
      primaryLogoFile: null,
      secondaryLogoFile: null,
      primaryColor: school.color?.primary ?? "#6366f1",
      secondaryColor: school.color?.secondary ?? "#8b5cf6",
      tertiaryColor: school.color?.tertiary ?? "#a855f7",
      loginBackgroundFile: null,
      eSignatureFile: null,
    },
    subscription: {
      plan,
      subscription_id: subscriptionId,
      modules: MODULE_IDS.reduce(
        (acc, id) => ({ ...acc, [id]: false }),
        {} as Record<string, boolean>,
      ),
      studentLimit: String(school.student_capacity ?? ""),
      staffLimit: "",
      storageLimit: "",
      paymentGateway: "",
    },
  };
}

// Keeps existing logo when no new upload
export function buildUpdateSchoolPayload(
  state: AddSchoolFormState,
  school: School,
  primaryLogoUrl: string | null,
  primaryLogoPublicId: string | null,
): UpdateSchoolRequest {
  const { identity, branding, subscription } = state;
  const phone =
    identity.countryCode && identity.contactPhone
      ? `${identity.countryCode}${identity.contactPhone.replace(/\D/g, "")}`
      : school.phone;

  const color: SchoolColor = {
    primary: branding.primaryColor || school.color?.primary || "#6366f1",
    secondary: branding.secondaryColor || school.color?.secondary || "#8b5cf6",
    tertiary: branding.tertiaryColor || school.color?.tertiary || "#a855f7",
    accent: branding.primaryColor || school.color?.accent || "#6366f1",
  };

  const logo: SchoolLogo = {
    svg: school.logo?.svg ?? "",
    image_url: primaryLogoUrl ?? school.logo?.image_url ?? null,
    image_public_id:
      primaryLogoPublicId ?? school.logo?.image_public_id ?? null,
  };

  const term = defaultTerm(identity.academicSession, identity.defaultTerms);
  const subSummary = school.subscription_details ?? school.subscription;
  const startDate =
    (subSummary as { start_date?: string })?.start_date ??
    new Date().toISOString().slice(0, 10);
  const endDate =
    (subSummary as { end_date?: string })?.end_date ??
    new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const subStatus = (subSummary as { status?: string })?.status ?? "active";

  const subscriptionPayload = {
    subscription_id: subscription.subscription_id,
    plan: subscription.plan.toLocaleLowerCase(),
    start_date: startDate,
    end_date: endDate,
    status: subStatus,
  };

  return {
    name: identity.schoolName,
    address: identity.address ?? school.address ?? "",
    email: identity.primaryEmail ?? school.email ?? "",
    phone: phone ?? "",
    website: identity.websiteDomain ?? school.website ?? "",
    motto: school.motto ?? "",
    type: identity.schoolType || school.type || "secondary",
    status: (school as { status?: string }).status ?? "active",
    established_date: identity.establishedDate || school.established_date,
    accreditation_number:
      identity.accreditationNumber ?? school.accreditation_number,
    license_number: identity.licenseNumber ?? school.license_number ?? "",
    student_capacity:
      parseInt(subscription.studentLimit, 10) || school.student_capacity,
    current_enrollment: school.current_enrollment ?? 0,
    color,
    logo,
    subscription: subscriptionPayload,
    facebook_url: school.facebook_url ?? "",
    twitter_url: school.twitter_url ?? "",
    instagram_url: school.instagram_url ?? "",
    linkedin_url: school.linkedin_url ?? "",
    is_active: school.is_active ?? true,
    term,
    bank: (school as unknown as { bank?: Bank }).bank ?? DEFAULT_BANK,
    score: school.score ?? { ca: 0, exam: 0, total: 0 },
    discount: school.discount ?? "",
    classes: school.classes ?? [],
    subjects: school.subjects ?? [],
    timetable_name: school.timetable_name ?? "",
    applicable_school_grade: school.applicable_school_grade ?? "",
    academic_term: school.academic_term ?? "",
    school_days: school.school_days ?? [],
    no_of_periods_per_day: school.no_of_periods_per_day ?? 0,
    default_period_duration: school.default_period_duration ?? 0,
    break_periods: Array.isArray(school.break_periods)
      ? (school.break_periods as unknown as Break[])
      : [],
    ...pickSchoolUpdateExtensionFields(school),
  };
}
