const productDB = new ProductDB();
const productForm = document.getElementById('productForm');
const productList = document.getElementById('productList');

// Elementi del modal di eliminazione
const deleteModal = document.getElementById('deleteModal');
const cancelDelete = document.getElementById('cancelDelete');
const confirmDelete = document.getElementById('confirmDelete');
let productToDelete = null;

// Elementi del modal di modifica
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const cancelEdit = document.getElementById('cancelEdit');
const editProduct = document.getElementById('editProduct');
const editStore = document.getElementById('editStore');
const editPrice = document.getElementById('editPrice');
const editDate = document.getElementById('editDate');
let productToEdit = null;

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
                <div class="flex space-x-2">
                    <button onclick="showEditModal(${product.id})" 
                        class="text-indigo-500 hover:text-indigo-700 focus:outline-none">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                    </button>
                    <button onclick="showDeleteModal(${product.id})" 
                        class="text-red-500 hover:text-red-700 focus:outline-none">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
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

// Funzioni per il modal di eliminazione
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

// Event listeners per il modal di eliminazione
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

// Chiudi il modal di eliminazione se si clicca fuori
if (deleteModal) {
    deleteModal.addEventListener('click', (e) => {
        if (e.target === deleteModal) {
            hideDeleteModal();
        }
    });
}

// Funzioni per il modal di modifica
window.showEditModal = async function(id) {
    productToEdit = id;
    const product = await productDB.getProduct(id);
    
    // Popola il form con i dati del prodotto
    editProduct.value = product.product;
    editStore.value = product.store;
    editPrice.value = product.price;
    editDate.value = product.date;
    
    editModal.classList.remove('hidden');
    editModal.classList.add('flex');
}

function hideEditModal() {
    editModal.classList.add('hidden');
    editModal.classList.remove('flex');
    productToEdit = null;
    editForm.reset();
}

// Event listeners per il modal di modifica
if (cancelEdit) {
    cancelEdit.addEventListener('click', hideEditModal);
}

if (editForm) {
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (productToEdit !== null) {
            const updatedProduct = {
                product: document.getElementById('editProduct').value,
                store: document.getElementById('editStore').value,
                price: parseFloat(document.getElementById('editPrice').value),
                date: document.getElementById('editDate').value
            };
            
            await productDB.updateProduct(productToEdit, updatedProduct);
            hideEditModal();
            await updateProductList();
        }
    });
}

// Chiudi il modal di modifica se si clicca fuori
if (editModal) {
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) {
            hideEditModal();
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
