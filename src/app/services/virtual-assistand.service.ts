import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { ParamsChatService } from '@core/models/class/params-chat-service';
import { AreasResponse } from '@core/models/interface/areas-response';

@Injectable({
  providedIn: 'root'
})
export class VirtualAssistandService {
  private baseUrl = environment.baseUrl;
  private baseUrlRust = environment.baseUrlRust;
  private baseUrlAzureSofwareOne = environment.baseUrlAzureSWO;
  private baseUrlAwsSofwareOne = environment.baseUrlAwsSWO;
  private urlMockAreasInformation = environment.urlMockAreasInformation;
  private baseUrlMockLocal = environment.baseUrlMock;

  constructor(private http: HttpClient) { }

  getAreasDetails(): Observable<AreasResponse> {
    return this.http.get<AreasResponse>(`${this.urlMockAreasInformation}`);
  }

  getRustGoogleGeminiAiQuery(combinedPrompt: any): Observable<any> {
    const params = {
      prompt: combinedPrompt,
      temperature: 1.0,
      top_k: 64,
      top_p: 0.95,
      max_tokens: 800
    };
    const endpoint = '/query-gemini';
    return this.http.post(`${this.baseUrlRust}${endpoint}`, params);
  }

  getAzureGpt4oResponse(combinedPrompt: any): Observable<any> {
    const params = {
      messages: [
        {
          role: "system",
          content: [
            {
              type: "text",
              text: "You are an AI assistant that helps people find information."
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: combinedPrompt
            }
          ],
        }
      ],
      temperature: 0.7,
      top_p: 0.95,
      max_tokens: 800
    };

    const endpoint = '/openai/deployments/gpt-4oComite/chat/completions';
    const pathParams = '?api-version=2023-03-15-preview';
    const urlWithParams = `${this.baseUrlAzureSofwareOne}${endpoint}${pathParams}`;

    return this.http.post(urlWithParams, params);
  }

  getAwsClaudeResponse(combinedPrompt: any): Observable<any> {
    const params = {
      prompt: combinedPrompt
    };
    return this.http.post(`${this.baseUrlAwsSofwareOne}`, params);
  }

  uploadPdf(file: File, params: ParamsChatService): Observable<any> {
    const formData = new FormData();
    formData.append('upload_pdf', file);

    const queryParams = new URLSearchParams({
      prompt_user: params.prompt_user,
      query_prompt_template: params.query_prompt_template.toString(),
      temperature: params.temperature.toString(),
      max_tokens: params.max_tokens.toString(),
      max_context: params.max_context.toString(),
      chunk_size: params.chunk_size.toString(),
      chunk_overlap: params.chunk_overlap.toString(),
      valor_area: params.valor_area.toString()
    }).toString();

    const urlWithParams = `${this.baseUrl}/chatpdf?${queryParams}`;

    return this.http.post(urlWithParams, formData);
  }

}