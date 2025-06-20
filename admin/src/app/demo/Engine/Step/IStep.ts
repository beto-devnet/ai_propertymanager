import { Result } from 'ts-results';

import { ErrorStepResult } from './ErrorStepResult';

export interface IStep<TInput, TOutput> {
  run(request: TInput): Promise<Result<TOutput, ErrorStepResult>>;
}
