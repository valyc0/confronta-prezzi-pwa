const productDB = new ProductDB();
const productForm = document.getElementById('productForm');
const productList = document.getElementById('productList');

// Elementi del modal
const deleteModal = document.getElementById('deleteModal');
const cancelDelete = document.getElementById('cancelDelete');
const confirmDelete = document.getElementById('confirmDelete');
let productToDelete = null;

// Formatta prezzo in Euro
const formatPrice = (price) => new Intl.NumberFormat('it-IT', {
    style: 'currency',
    currency: 'EUR'
}).format(price);

// Formatta data
const formatDate = (dateString) => new Intl.DateTimeFormat('it-IT').format(new Date(dateString));

// Aggiorna la lista dei prodotti
async function updateProductList() {
    const products = await productDB.getAllProducts();
    const filteredProducts = filterProducts(products);
    productList.innerHTML = '';

    if (filteredProducts.length === 0) {
        productList.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                Nessun prodotto trovato
            </div>
        `;
        return;
    }

    filteredProducts.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'bg-gray-50 p-4 rounded-lg shadow border border-gray-200';
        productCard.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="font-semibold text-lg text-indigo-600">${product.product}</h3>
                    <p class="text-gray-600">${product.store}</p>
                    <p class="text-gray-800 font-medium">${formatPrice(product.price)}</p>
                    <p class="text-sm text-gray-500">${formatDate(product.date)}</p>
                </div>
                <button onclick="showDeleteModal(${product.id})" 
                    class="text-red-500 hover:text-red-700 focus:outline-none">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>
        `;
        productList.appendChild(productCard);
    });
}

// Funzione di ricerca
function filterProducts(products) {
    const searchProduct = document.getElementById('searchProduct').value.toLowerCase();
    const searchStore = document.getElementById('searchStore').value.toLowerCase();
    const minPrice = document.getElementById('minPrice').value;
    const maxPrice = document.getElementById('maxPrice').value;

    return products.filter(product => {
        const matchProduct = product.product.toLowerCase().includes(searchProduct);
        const matchStore = product.store.toLowerCase().includes(searchStore);
        const matchPrice = (!minPrice || product.price >= parseFloat(minPrice)) &&
                         (!maxPrice || product.price <= parseFloat(maxPrice));
        
        return matchProduct && matchStore && matchPrice;
    });
}

// Funzioni per il modal
window.showDeleteModal = function(id) {
    productToDelete = id;
    deleteModal.classList.remove('hidden');
    deleteModal.classList.add('flex');
}

function hideDeleteModal() {
    deleteModal.classList.add('hidden');
    deleteModal.classList.remove('flex');
    productToDelete = null;
}

// Event listeners per il modal
if (cancelDelete) {
    cancelDelete.addEventListener('click', hideDeleteModal);
}

if (confirmDelete) {
    confirmDelete.addEventListener('click', async () => {
        if (productToDelete !== null) {
            await productDB.deleteProduct(productToDelete);
            hideDeleteModal();
            await updateProductList();
        }
    });
}

// Chiudi il modal se si clicca fuori
if (deleteModal) {
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) {
            hideDeleteModal();
        }
    });
}

// Gestisce l'invio del form
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const product = {
        product: document.getElementById('product').value,
        store: document.getElementById('store').value,
        price: parseFloat(document.getElementById('price').value),
        date: document.getElementById('date').value
    };

    await productDB.addProduct(product);
    productForm.reset();
    await updateProductList();
    setTodayDate(); // Reset the date to today after form submission
});

// Imposta la data di oggi come valore predefinito
function setTodayDate() {
    const dateInput = document.getElementById('date');
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    dateInput.value = `${year}-${month}-${day}`;
}

// Imposta la data quando la pagina si carica
setTodayDate();

// Carica la lista iniziale
productDB.init().then(() => updateProductList());

// Aggiungi event listener per la ricerca in tempo reale
const searchInputs = ['searchProduct', 'searchStore', 'minPrice', 'maxPrice'];
searchInputs.forEach(inputId => {
    const element = document.getElementById(inputId);
    if (element) {
        element.addEventListener('input', () => {
            updateProductList();
        });
    }
});
