export type UserRole = "user" | "admin";
export type UserStatus = "pending" | "approved" | "rejected";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  status: UserStatus;
  wallet_balance: number;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
};

export type WalletTxType = "topup" | "check_charge" | "refund" | "adjustment";

export type WalletTransaction = {
  id: string;
  user_id: string;
  type: WalletTxType;
  amount: number;
  note: string | null;
  created_by: string | null;
  created_at: string;
};

export type CheckStatus = "success" | "not_found" | "error";

export type McnCheck = {
  id: string;
  check_number: number;
  user_id: string;
  channel_input: string;
  channel_id: string | null;
  channel_name: string | null;
  network: string | null;
  network_contact_email: string | null;
  subscriber_count: number | null;
  total_views: number | null;
  video_count: number | null;
  avatar_url: string | null;
  status: CheckStatus;
  /** the provider's own processing state: "pending" while still being
   *  crawled, "updated" once final, null for not_found/error checks */
  provider_status: string | null;
  cost: number;
  raw_response: unknown;
  created_at: string;
};
