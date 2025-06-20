import { ErrorStepResult } from '../Step/ErrorStepResult';

export interface ServiceResponse<Type> {
  isError: boolean;
  data?: Type;
  error?: ErrorStepResult;
}
