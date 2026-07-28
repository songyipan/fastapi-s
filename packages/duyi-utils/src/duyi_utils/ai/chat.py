from collections.abc import AsyncGenerator, Iterable
from dataclasses import dataclass
from enum import StrEnum
from typing import cast

from openai import AsyncOpenAI
from openai.types.chat import ChatCompletionMessageParam


class MessageRole(StrEnum):
    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"


@dataclass
class AIMessage:
    role: MessageRole
    content: str


@dataclass
class AIChatConfig:
    api_key: str
    base_url: str = "https://api.openai.com/v1"
    model: str = "gpt-4o"


class AIChat:
    def __init__(self, config: AIChatConfig):
        self._config = config
        self._client = AsyncOpenAI(
            api_key=config.api_key,
            base_url=config.base_url,
        )

    async def chat_stream(
        self, messages: Iterable[AIMessage]
    ) -> AsyncGenerator[str, None]:
        payload = cast(
            list[ChatCompletionMessageParam],
            [{"role": msg.role.value, "content": msg.content} for msg in messages],
        )

        response = await self._client.chat.completions.create(
            model=self._config.model,
            messages=payload,
            stream=True,
        )

        async for chunk in response:
            delta = chunk.choices[0].delta
            if delta.content:
                yield delta.content
