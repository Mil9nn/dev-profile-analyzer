import { axiosInstance } from '../lib/axios'
import type { AnalyzeResponse, FormData } from '../types'

export class AnalysisService {
    static async analyzeProfile(data: FormData): Promise<AnalyzeResponse> {
        const response = await axiosInstance.post<AnalyzeResponse>('/analyze', data);
        return response.data;
    }
}