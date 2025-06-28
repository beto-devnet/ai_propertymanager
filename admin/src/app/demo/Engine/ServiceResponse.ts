export interface ServiceResponse<Type> {
  isError: boolean;
  data?: Type;
  error?: string;
}
