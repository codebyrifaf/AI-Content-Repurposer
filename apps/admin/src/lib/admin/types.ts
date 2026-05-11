export type AdminUserRow = {
  id: string;
  email: string | null;
  plan: string;
  monthlyGenerations: number;
  monthlyResetDate: string | null;
  signupAt: string;
  lastSignInAt: string | null;
  lastGenerationAt: string | null;
};

export type AdminGenerationRow = {
  id: string;
  userId: string;
  userEmail: string | null;
  topic: string;
  createdAt: string;
};

export type ChartSeries = {
  labels: string[];
  values: number[];
};

export type PlanDistribution = {
  labels: string[];
  values: number[];
};

export type AdminMetrics = {
  totalUsers: number;
  totalGenerations: number;
  freeUsers: number;
  proUsers: number;
  generationsThisMonth: number;
  activeUsersThisWeek: number;
  newestUsers: AdminUserRow[];
  newestGenerations: AdminGenerationRow[];
  generationsSeries: ChartSeries;
  signupSeries: ChartSeries;
  planDistribution: PlanDistribution;
};

export type AdminUsersPage = {
  users: AdminUserRow[];
  total: number;
  page: number;
  pageSize: number;
};
