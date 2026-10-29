async function cadastrarVendedor() {

    const nome = document.getElementById("nomeVendedor").value;
    const cep = document.getElementById("cepVendedor").value;

    const mensagem = document.getElementById("mensagem");


    // Verificar se os campos foram preenchidos

    if (nome === "" || cep === "") {

        mensagem.textContent =
            "Preencha o nome e o CEP.";

        return;
    }


    try {

        const resposta = await fetch(
            "http://localhost:3000/vendedores",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    nome: nome,
                    cep: cep
                })
            }
        );


        const dados = await resposta.json();


        if (!resposta.ok) {

            mensagem.textContent =
                dados.erro || "Erro ao cadastrar.";

            return;
        }


        mensagem.textContent =
            "Vendedor cadastrado com sucesso!";


        console.log(
            "Vendedor cadastrado:",
            dados
        );


        // Limpar os campos

        document.getElementById(
            "nomeVendedor"
        ).value = "";

        document.getElementById(
            "cepVendedor"
        ).value = "";


    } catch (erro) {

        console.error(
            "Erro:",
            erro
        );

        mensagem.textContent =
            "Não foi possível conectar ao servidor.";
    }

}