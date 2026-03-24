export interface Room {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  unique_string: string;
  owner_id: string;
  messages_cnt?: number;
}
