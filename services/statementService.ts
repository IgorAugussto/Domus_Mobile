import api from "../lib/api";

export interface StatementJobStarted {
  jobId: string;
}

export type JobStatus = "PENDING" | "PROCESSING" | "DONE" | "ERROR";

export interface StatementJobStatus {
  status: JobStatus;
  result: {
    total: number;
    saved: number;
    skipped: number;
    errors: string[];
  } | null;
}

export interface PickedStatementFile {
  uri: string;
  name: string;
  mimeType?: string | null;
  // No web, expo-document-picker expõe o File real aqui; a `uri` nesse caso é
  // uma data URI base64 que não serve para montar um FormData de upload.
  webFile?: File;
}

export const statementService = {
  /**
   * Envia o arquivo (selecionado via expo-document-picker) e a data de vencimento.
   * O backend responde imediatamente com 202 + { jobId }; o processamento acontece
   * em background via RabbitMQ.
   */
  import: async (file: PickedStatementFile, dueDate: string): Promise<StatementJobStarted> => {
    const formData = new FormData();
    if (file.webFile) {
      formData.append("file", file.webFile, file.name);
    } else {
      // React Native's FormData accepts this { uri, name, type } shape for file uploads.
      formData.append("file", {
        uri: file.uri,
        name: file.name,
        type: file.mimeType ?? "application/octet-stream",
      } as unknown as Blob);
    }
    formData.append("dueDate", dueDate);

    const response = await api.post("/statement/import", formData);
    return response.data;
  },

  getStatus: async (jobId: string): Promise<StatementJobStatus> => {
    const response = await api.get(`/statement/status/${jobId}`);
    return response.data;
  },
};
