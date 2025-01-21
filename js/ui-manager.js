import { 
    aggiungiProdotto, 
    aggiungiPrezzo, 
    cercaProdottiPerNome,
    getPrezziProdotto,
    getProdottiRecenti 
} from './db-manager.js';

// Funzione per mostrare i prodotti nella UI
export function mostraProdotti(prodotti, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    prodotti.forEach(prodotto => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${prodotto.immagine || 'placeholder.jpg'}" alt="${prodotto.nome}">
            <h3>${prodotto.nome}</h3>
            <p>${prodotto.descrizione || ''}</p>
            <button onclick="mostraDettagliProdotto('${prodotto.id}')">Vedi Prezzi</button>
        `;
        container.appendChild(card);
    });
}

// Funzione per mostrare i prezzi di un prodotto
export async function mostraDettagliProdotto(prodottoId) {
    const prezzi = await getPrezziProdotto(prodottoId);
    const container = document.getElementById('prezzi-container');
    container.innerHTML = '';

    prezzi.forEach(prezzo => {
        const prezzoElement = document.createElement('div');
        prezzoElement.className = 'prezzo-item';
        prezzoElement.innerHTML = `
            <div class="negozio">${prezzo.negozio}</div>
            <div class="prezzo">€${prezzo.prezzo}</div>
            <div class="data">${new Date(prezzo.data).toLocaleDateString()}</div>
            ${prezzo.url ? `<a href="${prezzo.url}" target="_blank">Vai al negozio</a>` : ''}
        `;
        container.appendChild(prezzoElement);
    });
}

// Funzione per la ricerca
export async function cercaProdotti(query) {
    const risultati = await cercaProdottiPerNome(query);
    mostraProdotti(risultati, 'risultati-ricerca');
}

// Funzione per aggiungere un nuovo prodotto
export async function handleNuovoProdotto(event) {
    event.preventDefault();
    const form = event.target;
    
    const prodotto = {
        nome: form.nome.value,
        categoria: form.categoria.value,
        descrizione: form.descrizione.value,
        immagine: form.immagine.value
    };

    try {
        const prodottoId = await aggiungiProdotto(prodotto);
        
        // Se c'è anche un prezzo, lo aggiungiamo
        if (form.prezzo && form.negozio) {
            await aggiungiPrezzo(prodottoId, {
                prezzo: parseFloat(form.prezzo.value),
                negozio: form.negozio.value,
                url: form.url?.value || ''
            });
        }

        alert('Prodotto aggiunto con successo!');
        form.reset();
    } catch (error) {
        alert('Errore nell\'aggiungere il prodotto');
        console.error(error);
    }
}

// Carica i prodotti recenti all'avvio
export async function caricaProdottiRecenti() {
    const prodottiRecenti = await getProdottiRecenti();
    mostraProdotti(prodottiRecenti, 'prodotti-recenti');
}
