import { NextResponse, NextRequest } from "next/server";
import { chats, type Chat } from "../data";

export async function POST(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let senderId = "e2c1a571-5f7e-4f56-9020-13f98b0eaba"
    let message ="ami n ew"
    let activeChat = chats.find((item) => item.id === id);

  const newMessageData = {
    message,
    time: new Date(),
    senderId: senderId,
    replayMetadata: false,
  };
  if (!activeChat) {
    activeChat = {
      id: id,
      userId: senderId,
      unseenMsgs: 0,
      chat: [newMessageData],
    };
    chats.push(activeChat);
  } else {
    activeChat.chat.push(newMessageData as any);
  }
    return NextResponse.json({
      status: "success",
      message: "Message sent successfully",
      data: activeChat,
    });
  } catch (error) {
    return NextResponse.json({
      status: "fail",
      message: "Something went wrong",
      data: error,
    });
  }
}
