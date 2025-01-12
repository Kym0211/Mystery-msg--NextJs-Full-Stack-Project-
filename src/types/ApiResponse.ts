import { Message } from "@/models/User";

export interface ApiResponse {
    split(arg0: string): unknown;
    success: boolean;
    message: string;
    isAcceptingMessage?: boolean;
    messages?: Array<Message>;
}