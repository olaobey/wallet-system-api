import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class TransactionLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TransactionLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body } = request;

    this.logger.log(`Transaction request: ${method} ${url}`, { body });

    return next.handle().pipe(
      tap(() => {
        this.logger.log(`Transaction completed: ${method} ${url}`);
      }),
      catchError((error) => {
        this.logger.error(`Transaction failed: ${method} ${url}`, error.stack);
        throw error;
      }),
    );
  }
}
