export interface Area {
    name: string;
    code: string;
    primaryColor: string;
    chatTitle: string;
    chatDescription: string;
    mainLogoUrl: string;
    faviconUrl: string;
    dataBase: boolean;
    query_prompt_template: boolean;
    temperature: number;
    max_tokens: number;
    max_context: number;
    chunk_size: number;
    chunk_overlap: number;
    valor_area: string;
}