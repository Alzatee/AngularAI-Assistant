import { HttpErrorResponse, HttpInterceptorFn } from "@angular/common/http";
import { environment } from "@environments/environment";
import { catchError, throwError } from "rxjs";

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const request = req.clone({
    setHeaders: {
      'Content-Type': 'application/json',
      'api-key': environment.SWO_AZURE_GPT_API_KEY
    }
  });

  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      const errorMessage = new Error(error.message);
      return throwError(() => errorMessage);
    })
  );
};