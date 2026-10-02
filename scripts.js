const botao = document.querySelector(".botao-gerar");
const blocoCodigo = document.querySelector(".bloco-codigo code");
const resultadoCodigo = document.querySelector(".resultado-codigo");
const caixaTexto = document.querySelector(".caixa-texto");

async function gerarCodigo() {
    const textoUsuario = caixaTexto.value.trim();

    if (!textoUsuario) {
        blocoCodigo.textContent = "Descreva o que você quer gerar primeiro.";
        return;
    }

    botao.disabled = true;
    botao.textContent = "Gerando...";
    blocoCodigo.textContent = "Gerando seu código...";

    try {
        const resposta = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                mensagem: textoUsuario
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.error || "Não foi possível gerar o código.");
        }

        const resultado = dados.resposta;
        blocoCodigo.textContent = resultado;
        resultadoCodigo.srcdoc = resultado;
    } catch (erro) {
        console.error(erro);
        blocoCodigo.textContent = `Erro: ${erro.message}`;
        resultadoCodigo.srcdoc = "";
    } finally {
        botao.disabled = false;
        botao.textContent = "Gerar código";
    }
}

botao.addEventListener("click", gerarCodigo);

caixaTexto.addEventListener("keydown", (evento) => {
    if ((evento.ctrlKey || evento.metaKey) && evento.key === "Enter") {
        gerarCodigo();
    }
});
