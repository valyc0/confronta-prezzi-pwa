import { supabase } from './supabase-config.js';

// Funzione per aggiungere un nuovo prodotto
export async function addProduct(product, store, price, date) {
    try {
        console.log('🔵 Iniziando inserimento nuovo prodotto in Supabase:', {
            product,
            store,
            price,
            date
        });

        const productData = {
            name: product,
            store: store,
            price: parseFloat(price),
            date: date,
            created_at: new Date().toISOString()
        };

        console.log('📝 Dati da salvare in Supabase:', productData);

        const { data, error } = await supabase
            .from('products')
            .insert(productData)
            .select()
            .single();

        if (error) throw error;

        console.log('✅ Prodotto salvato con successo in Supabase:', data);
        return data.id;
    } catch (error) {
        console.error('❌ Errore nell\'aggiungere il prodotto a Supabase:', error);
        throw error;
    }
}

// Funzione per verificare se un prodotto esiste già
export async function checkDuplicate(product, store) {
    try {
        console.log('🔍 Controllo duplicati in Supabase per:', {
            product,
            store
        });

        const { data, error } = await supabase
            .from('products')
            .select()
            .ilike('name', product)
            .ilike('store', store)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }

        if (data) {
            console.log('⚠️ Trovato duplicato in Supabase:', data);
            return data;
        } else {
            console.log('✅ Nessun duplicato trovato in Supabase');
            return null;
        }
    } catch (error) {
        console.error('❌ Errore nel controllo duplicati in Supabase:', error);
        return null;
    }
}

// Funzione per aggiornare un prodotto esistente
export async function updateProduct(productId, price, date) {
    try {
        console.log('🔄 Iniziando aggiornamento prodotto in Supabase:', {
            productId,
            price,
            date
        });

        const updates = {
            price: parseFloat(price),
            date: date,
            updated_at: new Date().toISOString()
        };
        
        console.log('📝 Dati da aggiornare in Supabase:', updates);
        
        const { data, error } = await supabase
            .from('products')
            .update(updates)
            .eq('id', productId)
            .select()
            .single();

        if (error) throw error;
        
        console.log('✅ Prodotto aggiornato con successo in Supabase:', data);
        return true;
    } catch (error) {
        console.error('❌ Errore nell\'aggiornare il prodotto in Supabase:', error);
        throw error;
    }
}

// Funzione per eliminare un prodotto
export async function deleteProduct(productId) {
    try {
        console.log('🗑️ Iniziando eliminazione prodotto da Supabase:', productId);
        
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', productId);

        if (error) throw error;
        
        console.log('✅ Prodotto eliminato con successo da Supabase');
        return true;
    } catch (error) {
        console.error('❌ Errore nell\'eliminare il prodotto da Supabase:', error);
        throw error;
    }
}

// Funzione per ottenere tutti i prodotti
export async function getAllProducts() {
    try {
        console.log('📥 Recupero tutti i prodotti da Supabase');
        
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('date', { ascending: false });

        if (error) throw error;
        
        console.log(`✅ Recuperati ${data.length} prodotti da Supabase:`, data);
        return data;
    } catch (error) {
        console.error('❌ Errore nel recuperare i prodotti da Supabase:', error);
        return [];
    }
}

// Funzione per cercare prodotti
export async function searchProducts(productQuery = '', storeQuery = '', minPrice = null, maxPrice = null) {
    try {
        console.log('🔍 Iniziando ricerca prodotti in Supabase:', {
            productQuery,
            storeQuery,
            minPrice,
            maxPrice
        });

        let query = supabase
            .from('products')
            .select('*');

        if (productQuery) {
            query = query.ilike('name', `%${productQuery}%`);
        }

        if (storeQuery) {
            query = query.ilike('store', `%${storeQuery}%`);
        }

        if (minPrice !== null) {
            query = query.gte('price', minPrice);
        }

        if (maxPrice !== null) {
            query = query.lte('price', maxPrice);
        }

        const { data, error } = await query.order('date', { ascending: false });

        if (error) throw error;

        console.log(`✅ Trovati ${data.length} prodotti che corrispondono ai criteri di ricerca`);
        return data;
    } catch (error) {
        console.error('❌ Errore nella ricerca dei prodotti in Supabase:', error);
        return [];
    }
}

// Funzione per ottenere la lista dei negozi
export async function getStoresList() {
    try {
        console.log('🏪 Recupero lista negozi da Supabase');
        
        const { data, error } = await supabase
            .from('products')
            .select('store')
            .order('store');

        if (error) throw error;

        const stores = [...new Set(data.map(item => item.store))];
        
        console.log('✅ Lista negozi recuperata:', stores);
        return stores;
    } catch (error) {
        console.error('❌ Errore nel recuperare la lista dei negozi da Supabase:', error);
        return [];
    }
}
