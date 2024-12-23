export interface CreateAccountPayload {
  name: string,
  initialBalance: number,
  currency: string,
  type: string,
  cardNumber?: string
}

export interface UpdateAccountPayload extends Partial<CreateAccountPayload> {
  id: string;
}

export interface DeleteAccountPayload {
  id: string;
}