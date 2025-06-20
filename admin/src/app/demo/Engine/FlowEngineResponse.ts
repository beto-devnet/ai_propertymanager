import { ErrorStepResult } from './Step/ErrorStepResult';

export interface FlowEngineResponse<T> {
  data?: T,
  error?: ErrorStepResult
  isError: boolean;
}
