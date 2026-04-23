const CHAT_SERVICE_URL = process.env.NEXT_PUBLIC_CHAT_SERVICE_URL || "http://localhost:3003";

export interface SendChatMessageRequest {
  roomId: string;
  channel: "all" | "wolves";
  senderId: string;
  senderName: string;
  content: string;
  round: number;
  phase: string;
}

export interface SendChatMessageResponse {
  success: boolean;
  code?: string;
  message?: string;
}

export async function sendChatMessage(
  request: SendChatMessageRequest
): Promise<SendChatMessageResponse> {
  try {
    const response = await fetch(`${CHAT_SERVICE_URL}/chat/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      return {
        success: false,
        message: "Failed to send message",
      };
    }

    return await response.json();
  } catch (error) {
    console.error("Chat API error:", error);
    return {
      success: false,
      message: "Network error",
    };
  }
}
