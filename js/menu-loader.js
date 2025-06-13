// Menu loading functions
document.addEventListener('DOMContentLoaded', () => {
    loadMenu();
});

// Fonction pour charger le menu depuis le fichier JSON
async function loadMenu() {
    const loadingContainer = document.getElementById('loading-container');
    const errorContainer = document.getElementById('error-container');
    const menuGrid = document.getElementById('menu-grid');

    try {
        // Afficher l'indicateur de chargement
        if (loadingContainer) {
            loadingContainer.style.display = 'flex';
        }
        if (errorContainer) {
            errorContainer.style.display = 'none';
        }
        if (menuGrid) {
            menuGrid.innerHTML = '';
        }

        console.log('🔄 Chargement du menu...');

        // Charger les données du menu
        const response = await fetch('js/menu-data.json');
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const menuData = await response.json();
        
        // Filtrer les éléments disponibles
        const availableItems = menuData.filter(item => item.available);

        if (availableItems.length === 0) {
            throw new Error('Aucun plat disponible actuellement');
        }

        // Afficher le menu
        displayMenu(availableItems);
        
        console.log(`✅ ${availableItems.length} plats chargés avec succès`);

    } catch (error) {
        console.error('❌ Erreur lors du chargement du menu:', error);
        showError(error.message);
    } finally {
        // Cacher l'indicateur de chargement
        if (loadingContainer) {
            loadingContainer.style.display = 'none';
        }
    }
}

// Fonction pour afficher le menu
function displayMenu(menuItems) {
    const menuGrid = document.getElementById('menu-grid');
    if (!menuGrid) return;

    // Vider le container du menu
    menuGrid.innerHTML = '';
    menuGrid.style.display = 'grid';

    // Créer les éléments du menu dynamiquement
    menuItems.forEach(item => {
        // Créer l'élément principal
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.dataset.category = item.category;

        // Créer l'image
        const img = document.createElement('img');
        img.src = item.image;
        img.alt = item.name;
        img.onerror = function() {
            this.src = `https://via.placeholder.com/300x200/${getRandomColor()}/ffffff?text=${encodeURIComponent(item.name)}`;
        };

        // Créer le titre
        const title = document.createElement('h3');
        title.textContent = item.name;

        // Créer la description
        const description = document.createElement('p');
        description.textContent = item.description;

        // Créer le prix
        const price = document.createElement('div');
        price.className = 'menu-price';
        price.textContent = `€${parseFloat(item.price).toFixed(2)}`;

        // Créer le bouton d'achat
        const buyButton = document.createElement('button');
        buyButton.className = 'buy-btn';
        buyButton.dataset.price = item.price;
        buyButton.dataset.item = item.name;
        buyButton.dataset.id = item.id;
        buyButton.textContent = 'Ajouter au panier';

        // Ajouter l'événement click
        buyButton.addEventListener('click', function() {
            const price = parseFloat(this.dataset.price);
            const itemName = this.dataset.item;
            
            if (window.cart) {
                window.cart.addItem(itemName, price);
            } else {
                console.error('Le panier n\'est pas initialisé');
            }
        });

        // Ajouter tous les éléments à l'élément de menu
        menuItem.appendChild(img);
        menuItem.appendChild(title);
        menuItem.appendChild(description);
        menuItem.appendChild(price);
        menuItem.appendChild(buyButton);

        // Ajouter l'élément de menu à la grille
        menuGrid.appendChild(menuItem);
    });

    // Masquer l'indicateur de chargement
    const loadingContainer = document.getElementById('loading-container');
    if (loadingContainer) {
        loadingContainer.style.display = 'none';
    }
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
        errorContainer.style.display = 'none';
    }
}

// Fonction pour afficher une erreur
function showError(message) {
    const errorContainer = document.getElementById('error-container');
    const menuGrid = document.getElementById('menu-grid');
    
    if (errorContainer) {
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) {
            errorMessage.textContent = message;
        }
        errorContainer.style.display = 'block';
    } else {
        console.error('Container d\'erreur non trouvé:', message);
    }
    
    if (menuGrid) {
        menuGrid.style.display = 'none';
    }
}

// Fonction utilitaire pour générer une couleur aléatoire pour les images de remplacement
function getRandomColor() {
    const colors = ['ff6b35', 'f7931e', 'ffd23f', '2A767D', '3E900B', '764ba2'];
    return colors[Math.floor(Math.random() * colors.length)];
}
