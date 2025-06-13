// État global de l'application
let menuData = [];
let cart = [];
let orders = [];
let currentOrderId = null;

// Éléments DOM
const loadMenuBtn = document.getElementById('load-menu-btn');
const menuContainer = document.getElementById('menu-container');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const orderSummary = document.getElementById('order-summary');
const orderTracking = document.getElementById('order-tracking');
const adminSection = document.getElementById('admin-section');

// 1. CHARGEMENT DU MENU VIA API SIMULÉE
async function loadMenu() {
    try {
        loadMenuBtn.textContent = 'Chargement...';
        loadMenuBtn.disabled = true;
        
        // Simulation d'un appel API avec fetch
        const response = await fetch('https://keligmartin.github.io/api/menu.json');
        
        if (!response.ok) {
            throw new Error('Erreur de chargement du menu');
        }
        
        menuData = await response.json();
        displayMenu();
        
    } catch (error) {
        console.error('Erreur:', error);
        // Menu de fallback en cas d'erreur avec images
        menuData = [
            {
                "id": 1,
                "name": "Burger Classique",
                "description": "Pain, steak, salade, tomate, oignon",
                "price": 8.50,
                "category": "Burgers",
                "image": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop"
            },
            {
                "id": 2,
                "name": "Pizza Margherita",
                "description": "Sauce tomate, mozzarella, basilic",
                "price": 12.00,
                "category": "Pizzas",
                "image": "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop"
            },
            {
                "id": 3,
                "name": "Salade César",
                "description": "Salade, poulet, parmesan, croûtons",
                "price": 9.50,
                "category": "Salades",
                "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop"
            },
            {
                "id": 4,
                "name": "Tacos Poulet",
                "description": "Tortilla, poulet grillé, légumes, sauce",
                "price": 7.50,
                "category": "Tacos",
                "image": "https://images.unsplash.com/photo-1565299585323-38174c4a6d52?w=300&h=200&fit=crop"
            },
            {
                "id": 5,
                "name": "Burger Végétarien",
                "description": "Pain complet, steak végétal, légumes",
                "price": 9.00,
                "category": "Burgers",
                "image": "https://images.unsplash.com/photo-1525059696034-4967a729002e?w=300&h=200&fit=crop"
            },
            {
                "id": 6,
                "name": "Frites Maison",
                "description": "Pommes de terre fraîches, sel de mer",
                "price": 4.50,
                "category": "Accompagnements",
                "image": "https://images.unsplash.com/photo-1576107232684-1279f390859f?w=300&h=200&fit=crop"
            }
        ];
        displayMenu();
        alert('Menu de démonstration chargé (erreur de connexion)');
    }
}

function displayMenu() {
    menuContainer.innerHTML = '';
    
    // Grouper par catégorie
    const categories = [...new Set(menuData.map(item => item.category))];
    
    categories.forEach(category => {
        const categorySection = document.createElement('div');
        categorySection.innerHTML = `<h3 class="category-title">FOOD</h3>`;
        
        const categoryItems = menuData.filter(item => item.category === category);
        const itemsGrid = document.createElement('div');
        itemsGrid.className = 'menu-grid';
        
        categoryItems.forEach(item => {
            const menuItemDiv = document.createElement('div');
            menuItemDiv.className = 'menu-item';
            
            // Générer le nom de l'image basé sur le nom de l'item
            const imageName = item.name.toLowerCase()
                .replace(/[àáâãäå]/g, 'a')
                .replace(/[èéêë]/g, 'e')
                .replace(/[ìíîï]/g, 'i')
                .replace(/[òóôõö]/g, 'o')
                .replace(/[ùúûü]/g, 'u')
                .replace(/[ç]/g, 'c')
                .replace(/[^a-z0-9]/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
            
            menuItemDiv.innerHTML = `
                <div class="menu-item-image">
                    <img src="images/${imageName}.jpg" 
                         alt="${item.name}" 
                         onerror="this.onerror=null; this.src=item.image || 'https://via.placeholder.com/300x200?text=No+Image'">
                </div>
                <div class="menu-item-content">
                    <div class="menu-item-info">
                        <h3>${item.name}</h3>
                    </div>
                    <div class="menu-item-actions">
                        <span class="menu-item-price">${item.price.toFixed(2)}€</span>
                        <button onclick="addToCart(${item.id})" class="add-to-cart-btn">
                            <i class="fas fa-plus"></i> Ajouter
                        </button>
                    </div>
                </div>
            `;
            itemsGrid.appendChild(menuItemDiv);
        });
        
        categorySection.appendChild(itemsGrid);
        menuContainer.appendChild(categorySection);
    });
    
    loadMenuBtn.style.display = 'none';
}

// 2. GESTION DU PANIER
function addToCart(itemId) {
    const item = menuData.find(item => item.id === itemId);
    const existingItem = cart.find(cartItem => cartItem.id === itemId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...item,
            quantity: 1
        });
    }
    
    updateCartDisplay();
    updateCheckoutButton();
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    updateCartDisplay();
    updateCheckoutButton();
}

function updateQuantity(itemId, change) {
    const item = cart.find(cartItem => cartItem.id === itemId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(itemId);
        } else {
            updateCartDisplay();
        }
    }
}

function updateCartDisplay() {
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p>Votre panier est vide</p>';
        cartTotal.textContent = 'Total: 0.00€';
        return;
    }
    
    cart.forEach(item => {
        const cartItemDiv = document.createElement('div');
        cartItemDiv.className = 'cart-item';
        cartItemDiv.innerHTML = `
            <div>
                <strong>${item.name}</strong>
                <p>${item.price.toFixed(2)}€ x ${item.quantity}</p>
            </div>
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                <button onclick="removeFromCart(${item.id})">Supprimer</button>
            </div>
        `;
        cartItems.appendChild(cartItemDiv);
    });
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `Total: ${total.toFixed(2)}€`;
}

function updateCheckoutButton() {
    checkoutBtn.disabled = cart.length === 0;
}

// 3. RÉCAPITULATIF AVANT COMMANDE
function showOrderSummary() {
    const summaryItems = document.getElementById('summary-items');
    const summaryTotal = document.getElementById('summary-total');
    
    summaryItems.innerHTML = '';
    
    cart.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.innerHTML = `
            <p><strong>${item.name}</strong> x ${item.quantity} = ${(item.price * item.quantity).toFixed(2)}€</p>
        `;
        summaryItems.appendChild(itemDiv);
    });
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    summaryTotal.innerHTML = `<h3>Total: ${total.toFixed(2)}€</h3>`;
    
    orderSummary.classList.remove('hidden');
    document.getElementById('menu-section').classList.add('hidden');
    document.getElementById('cart-section').classList.add('hidden');
}

function editOrder() {
    orderSummary.classList.add('hidden');
    document.getElementById('menu-section').classList.remove('hidden');
    document.getElementById('cart-section').classList.remove('hidden');
}

// 4. SIMULATION D'ENVOI + SUIVI DE COMMANDE
function confirmOrder() {
    currentOrderId = Date.now();
    const order = {
        id: currentOrderId,
        items: [...cart],
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        status: 'En préparation',
        timestamp: new Date().toLocaleString(),
        estimatedTime: Math.floor(Math.random() * 20) + 10 // 10-30 minutes
    };
    
    orders.push(order);
    
    // Vider le panier
    cart = [];
    updateCartDisplay();
    updateCheckoutButton();
    
    // Afficher le suivi
    showOrderTracking(order);
    
    // Simuler les changements de statut
    simulateOrderProgress(currentOrderId);
}

function showOrderTracking(order) {
    orderSummary.classList.add('hidden');
    orderTracking.classList.remove('hidden');
    
    updateOrderStatus(order);
}

function updateOrderStatus(order) {
    const orderStatus = document.getElementById('order-status');
    const orderDetails = document.getElementById('order-details');
    
    let statusClass = '';
    switch(order.status) {
        case 'En préparation':
            statusClass = 'status-preparing';
            break;
        case 'Prêt':
            statusClass = 'status-ready';
            break;
        case 'Livré':
            statusClass = 'status-delivered';
            break;
    }
    
    orderStatus.innerHTML = `
        <h3>Commande #${order.id}</h3>
        <p class="${statusClass}">Statut: ${order.status}</p>
        <p>Temps estimé: ${order.estimatedTime} minutes</p>
    `;
    
    orderDetails.innerHTML = `
        <h4>Détails de votre commande:</h4>
        ${order.items.map(item => 
            `<p>${item.name} x ${item.quantity} = ${(item.price * item.quantity).toFixed(2)}€</p>`
        ).join('')}
        <p><strong>Total: ${order.total.toFixed(2)}€</strong></p>
        <p>Commandé le: ${order.timestamp}</p>
    `;
}

function simulateOrderProgress(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    // Passer à "Prêt" après 5 secondes
    setTimeout(() => {
        order.status = 'Prêt';
        if (currentOrderId === orderId) {
            updateOrderStatus(order);
        }
        
        // Passer à "Livré" après 10 secondes supplémentaires
        setTimeout(() => {
            order.status = 'Livré';
            if (currentOrderId === orderId) {
                updateOrderStatus(order);
            }
        }, 10000);
    }, 5000);
}

// 5. GESTION DES COMMANDES (ADMIN)
function toggleAdmin() {
    const isHidden = adminSection.classList.contains('hidden');
    
    if (isHidden) {
        adminSection.classList.remove('hidden');
        displayOrdersList();
        document.getElementById('show-admin-btn').textContent = 'Masquer Admin';
    } else {
        adminSection.classList.add('hidden');
        document.getElementById('show-admin-btn').textContent = 'Mode Administrateur';
    }
}

function displayOrdersList() {
    const ordersList = document.getElementById('orders-list');
    
    if (orders.length === 0) {
        ordersList.innerHTML = '<p>Aucune commande pour le moment</p>';
        return;
    }
    
    ordersList.innerHTML = '<h3>Liste des commandes:</h3>';
    
    orders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        orderCard.innerHTML = `
            <h4>Commande #${order.id}</h4>
            <p>Status: <span class="status-${order.status.toLowerCase().replace(' ', '-')}">${order.status}</span></p>
            <p>Total: ${order.total.toFixed(2)}€</p>
            <p>Commandé le: ${order.timestamp}</p>
            <details>
                <summary>Voir détails</summary>
                ${order.items.map(item => 
                    `<p>• ${item.name} x ${item.quantity}</p>`
                ).join('')}
            </details>
            <div>
                <button onclick="updateOrderStatus2(${order.id}, 'En préparation')">En préparation</button>
                <button onclick="updateOrderStatus2(${order.id}, 'Prêt')">Prêt</button>
                <button onclick="updateOrderStatus2(${order.id}, 'Livré')">Livré</button>
            </div>
        `;
        ordersList.appendChild(orderCard);
    });
}

function updateOrderStatus2(orderId, newStatus) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        order.status = newStatus;
        displayOrdersList();
        
        // Mettre à jour l'affichage du suivi si c'est la commande courante
        if (currentOrderId === orderId) {
            updateOrderStatus(order);
        }
    }
}

// 6. BONUS - Fonctionnalités supplémentaires
function resetApp() {
    cart = [];
    orders = [];
    currentOrderId = null;
    
    updateCartDisplay();
    updateCheckoutButton();
    
    document.getElementById('menu-section').classList.remove('hidden');
    document.getElementById('cart-section').classList.remove('hidden');
    orderSummary.classList.add('hidden');
    orderTracking.classList.add('hidden');
    adminSection.classList.add('hidden');
    
    loadMenuBtn.style.display = 'block';
    menuContainer.innerHTML = '';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    loadMenuBtn.addEventListener('click', loadMenu);
    checkoutBtn.addEventListener('click', showOrderSummary);
    document.getElementById('confirm-order-btn').addEventListener('click', confirmOrder);
    document.getElementById('edit-order-btn').addEventListener('click', editOrder);
    document.getElementById('show-admin-btn').addEventListener('click', toggleAdmin);
    
    // Charger automatiquement le menu au démarrage
    loadMenu();
});

// Sauvegarde locale (bonus)
function saveToLocalStorage() {
    localStorage.setItem('foodTruckCart', JSON.stringify(cart));
    localStorage.setItem('foodTruckOrders', JSON.stringify(orders));
}

function loadFromLocalStorage() {
    const savedCart = localStorage.getItem('foodTruckCart');
    const savedOrders = localStorage.getItem('foodTruckOrders');
    
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartDisplay();
        updateCheckoutButton();
    }
    
    if (savedOrders) {
        orders = JSON.parse(savedOrders);
    }
}

// Sauvegarder à chaque modification
window.addEventListener('beforeunload', saveToLocalStorage);

// Charger au démarrage
document.addEventListener('DOMContentLoaded', loadFromLocalStorage);
