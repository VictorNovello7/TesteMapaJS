let mapa;

async function buscarVendedores() {

    const cep = document.getElementById("cepCliente").value;

    const mensagem = document.getElementById("mensagem");

    if (cep === "") {

        mensagem.textContent = "Digite um CEP.";

        return;

    }

    try {

        const resposta = await fetch(
            `https://wade-backend-hsn9.onrender.com/vendedores/proximos/${cep}`
        );
        const dados = await resposta.json();

        if (!resposta.ok) {

            mensagem.textContent =
                dados.erro || "Erro ao buscar vendedores.";

            return;

        }

        if (mapa) {
            mapa.remove();
        }

        mapa = L.map("mapa").setView(
            [
                dados.cliente.latitude,
                dados.cliente.longitude
            ],
            13
        );

        L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                attribution:
                    "&copy; OpenStreetMap contributors"
            }
        ).addTo(mapa);

        L.marker([
            dados.cliente.latitude,
            dados.cliente.longitude
        ])
            .addTo(mapa)
            .bindPopup("Você está aqui.")
            .openPopup();

        dados.vendedores.forEach(vendedor => {

            L.marker([
                parseFloat(vendedor.latitude),
                parseFloat(vendedor.longitude)
            ])
                .addTo(mapa)
                .bindPopup(
                    `<b>${vendedor.nome}</b><br>` +
                    `Distância: ${vendedor.distancia.toFixed(2)} km`
                );

        });

        mensagem.textContent =
            `${dados.vendedores.length} vendedor(es) encontrado(s).`;

    } catch (erro) {

        console.error(erro);

        mensagem.textContent =
            "Não foi possível conectar ao servidor.";

    }

}