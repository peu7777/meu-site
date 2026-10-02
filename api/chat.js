export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Método não permitido." });
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        return res.status(500).json({
            error: "A variável GROQ_API_KEY não foi configurada no servidor."
        });
    }

    const mensagem = req.body?.mensagem?.trim();

    if (!mensagem) {
        return res.status(400).json({ error: "Digite uma descrição para gerar o código." });
    }

    if (mensagem.length > 2500) {
        return res.status(400).json({ error: "A descrição está muito longa." });
    }

    try {
        const resposta = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "openai/gpt-oss-20b",
                messages: [
                    {
                        role: "system",
                        content: "Você é um gerador de código HTML e CSS. Responda SOMENTE com código puro de HTML e CSS, sem crases, markdown ou explicações. Formato: primeiro <style> com o CSS, depois o HTML. Siga fielmente o pedido do usuário. Se pedir algo quicando, use translateY no @keyframes. Se pedir algo girando, use rotate."
                    },
                    {
                        role: "user",
                        content: mensagem
                    }
                ]
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            console.error("Erro da Groq:", dados);
            return res.status(resposta.status).json({
                error: dados?.error?.message || "A Groq não conseguiu gerar o código."
            });
        }

        const conteudo = dados?.choices?.[0]?.message?.content;

        if (!conteudo) {
            return res.status(502).json({ error: "A IA retornou uma resposta vazia." });
        }

        return res.status(200).json({ resposta: conteudo });
    } catch (erro) {
        console.error("Erro interno:", erro);
        return res.status(500).json({ error: "Erro ao consultar a IA." });
    }
}
