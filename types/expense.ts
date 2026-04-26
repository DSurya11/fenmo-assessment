export type Category = 
  | 'Food' 
  | 'Transport' 
  | 'Shopping' 
  | 'Entertainment' 
  | 'Health' 
  | 'Bills' 
  | 'Other'

export interface Expense {
  id: string
  amount: number
  category: Category
  description: string
  date: string
  created_at: string
  idempotency_key?: string
}

export interface CreateExpenseInput {
  amount: number
  category: Category
  description: string
  date: string
  idempotency_key?: string
}
