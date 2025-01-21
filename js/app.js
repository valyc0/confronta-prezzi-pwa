import { 
    addProduct, 
    checkDuplicate, 
    updateProduct, 
    deleteProduct, 
    getAllProducts, 
    searchProducts,
    getStoresList 
} from './db.js';

// Elementi DOM
const productForm = document.getElementById('productForm');
const productList = document.getElementById('productList');
const deleteModal = document.getElementById('deleteModal');
const editModal = document.getElementById('editModal');
const duplicateModal = document.getElementById('duplicateModal');
const searchProduct = document.getElementById('searchProduct');
const searchStore = document.getElementById('searchStore');
const minPrice = document.getElementById('minPrice');
const maxPrice = document.getElementById('maxPrice');
const storesList = document.getElementById('storesList');

// Variabili globali per tenere traccia dell'elemento corrente
let currentProductId = null;

// Inizializzazione
document.addEventListener('DOMContentLoaded', async () => {
    await initApp();
});

// Funzione per inizializzare l'applicazione
async function initApp() {
    // Imposta la data di oggi come valore predefinito
    document.getElementById('date').valueAsDate = new Date();
    
    // Carica la lista dei negozi per l'autocomplete
    await updateStoresList();
    
    // Carica tutti i prodotti
    await loadProducts();
    
    // Aggiungi gli event listener
    setupEventListeners();
}

// Funzione per aggiornare la lista dei negozi
async function updateStoresList() {
    const stores = await getStoresList();
    const storesList = document.getElementById('storesList');
    storesList.innerHTML = '';
    stores.forEach(store => {
        const option = document.createElement('option');
        option.value = store;
        storesList.appendChild(option);
    });
}

// Funzione per caricare e visualizzare i prodotti
async function loadProducts() {
    const products = await getAllProducts();
    displayProducts(products);
}

// Funzione per visualizzare i prodotti
function displayProducts(products) {
    const productList = document.getElementById('productList');
    productList.innerHTML = '';

    products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'bg-white p-4 rounded-lg shadow';
        productDiv.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="text-lg font-semibold">${product.name}</h3>
                    <p class="text-gray-600">${product.store}</p>
                </div>
                <div class="text-right">
                    <p class="text-xl font-bold text-indigo-600">€${product.price.toFixed(2)}</p>
                    <p class="text-sm text-gray-500">${new Date(product.date).toLocaleDateString()}</p>
                </div>
            </div>
            <div class="mt-4 flex justify-end space-x-2">
                <button class="delete-btn px-3 py-1 text-red-600 hover:text-red-800" data-id="${product.id}">
                    Elimina
                </button>
                <button class="edit-btn px-3 py-1 text-blue-600 hover:text-blue-800" data-id="${product.id}">
                    Modifica
                </button>
            </div>
        `;

        const deleteBtn = productDiv.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => showDeleteModal(product.id));

        const editBtn = productDiv.querySelector('.edit-btn');
        editBtn.addEventListener('click', () => handleEdit(product.id));

        productList.appendChild(productDiv);
    });
}

// Funzione per mostrare il modal di eliminazione
function showDeleteModal(productId) {
    const modal = document.getElementById('deleteModal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    const confirmBtn = document.getElementById('confirmDelete');
    const cancelBtn = document.getElementById('cancelDelete');

    const confirmHandler = async () => {
        await deleteProduct(productId);
        await loadProducts();
        hideDeleteModal();
    };

    const cancelHandler = () => {
        hideDeleteModal();
    };

    confirmBtn.addEventListener('click', confirmHandler, { once: true });
    cancelBtn.addEventListener('click', cancelHandler, { once: true });
}

// Funzione per nascondere il modal di eliminazione
function hideDeleteModal() {
    const modal = document.getElementById('deleteModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

// Funzione per mostrare il modal dei duplicati
function showDuplicateModal(duplicate, newPrice, newDate) {
    const modal = document.getElementById('duplicateModal');
    document.getElementById('previousPrice').textContent = `€${duplicate.price.toFixed(2)}`;
    document.getElementById('previousDate').textContent = new Date(duplicate.date).toLocaleDateString();

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    const confirmBtn = document.getElementById('confirmDuplicate');
    const cancelBtn = document.getElementById('cancelDuplicate');

    const confirmHandler = async () => {
        await updateProduct(duplicate.id, newPrice, newDate);
        await loadProducts();
        hideDuplicateModal();
    };

    const cancelHandler = () => {
        hideDuplicateModal();
    };

    confirmBtn.addEventListener('click', confirmHandler, { once: true });
    cancelBtn.addEventListener('click', cancelHandler, { once: true });
}

// Funzione per nascondere il modal dei duplicati
function hideDuplicateModal() {
    const modal = document.getElementById('duplicateModal');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
}

// Funzione per impostare gli event listener
function setupEventListeners() {
    // Form di aggiunta prodotto
    const productForm = document.getElementById('productForm');
    productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const product = document.getElementById('product').value;
        const store = document.getElementById('store').value;
        const price = document.getElementById('price').value;
        const date = document.getElementById('date').value;

        const duplicate = await checkDuplicate(product, store);
        
        if (duplicate) {
            showDuplicateModal(duplicate, price, date);
        } else {
            await addProduct(product, store, price, date);
            await loadProducts();
            productForm.reset();
            document.getElementById('date').valueAsDate = new Date();
        }
    });

    // Ricerca prodotti
    let searchTimeout;
    const searchProduct = document.getElementById('searchProduct');
    const searchStore = document.getElementById('searchStore');
    const minPrice = document.getElementById('minPrice');
    const maxPrice = document.getElementById('maxPrice');

    const performSearch = async () => {
        const products = await searchProducts(
            searchProduct.value,
            searchStore.value,
            minPrice.value ? parseFloat(minPrice.value) : null,
            maxPrice.value ? parseFloat(maxPrice.value) : null
        );
        displayProducts(products);
    };

    const debouncedSearch = () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(performSearch, 300);
    };

    searchProduct.addEventListener('input', debouncedSearch);
    searchStore.addEventListener('input', debouncedSearch);
    minPrice.addEventListener('input', debouncedSearch);
    maxPrice.addEventListener('input', debouncedSearch);
}

// Gestione della modifica
async function handleEdit(productId) {
    try {
        const products = await getAllProducts();
        const product = products.find(p => p.id === productId);
        
        if (product) {
            currentProductId = productId;
            document.getElementById('editProduct').value = product.name;
            document.getElementById('editStore').value = product.store;
            document.getElementById('editPrice').value = product.price;
            document.getElementById('editDate').value = product.date;
            
            editModal.classList.remove('hidden');
            editModal.classList.add('flex');
        }
    } catch (error) {
        console.error('Errore nel caricamento del prodotto:', error);
        alert('Errore nel caricamento del prodotto');
    }
}

async function handleEditSubmit(event) {
    event.preventDefault();
    
    const price = document.getElementById('editPrice').value;
    const date = document.getElementById('editDate').value;
    
    try {
        await updateProduct(currentProductId, price, date);
        editModal.classList.add('hidden');
        await loadProducts();
    } catch (error) {
        console.error('Errore durante l\'aggiornamento:', error);
        alert('Errore durante l\'aggiornamento del prodotto');
    }
}

// Event listeners per il modal di modifica
document.getElementById('cancelEdit').addEventListener('click', () => {
    editModal.classList.add('hidden');
});
document.getElementById('editForm').addEventListener('submit', handleEditSubmit);

// Rendi disponibili le funzioni necessarie globalmente
window.handleEdit = handleEdit;
