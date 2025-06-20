import { DestroyRef } from '@angular/core';
import { delay, pipe } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Step } from '../../models/step';

export class StepBase {
  protected commonOperators(step: Step, destroyRef: DestroyRef, delayMs = 1500) {
    return pipe(
      takeUntilDestroyed(destroyRef),
      delay(delayMs)
    );
  };
}
