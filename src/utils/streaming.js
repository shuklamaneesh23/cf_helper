// utils/streaming.js
export const parseStream = async (response, onDataChunk) => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let result = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        result +=(chunk.slice(3,-2));
        onDataChunk(result);
    }
};
