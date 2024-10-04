import { MessageChat } from "../class/message-chat"
import { TypeChats } from "../enums/type-chats";

export type TypeChat = TypeChats.VirtualAssistant | TypeChats.User;

export type Chats = {
    type: TypeChat,
    messageChat: MessageChat,
    timeResponseAPI?: string
}