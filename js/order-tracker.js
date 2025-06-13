// Gestion du suivi des commandes
class OrderTracker {
    constructor() {
        this.orders = JSON.parse(localStorage.getItem('userOrders')) || [];
        this.statuses = [
            { id: 'preparing', label: 'En préparation', icon: '👨‍🍳', time: 5000 },
            { id: 'delivery', label: 'En livraison', icon: '🚚', time: 8000 },
            { id: 'delivered', label: 'Livré !', icon: '✅', time: 0 }
        ];
        this.activeOrder = null;
        this.init();
    }

    init() {
        this.createOrdersSection();
        this.loadOrders();
    }

    createOrdersSection() {
        // Vérifier si la section existe déjà
        if (document.getElementById('orders-section')) return;

        // Créer la section des commandes
        const ordersSection = document.createElement('div');
        ordersSection.className = 'order-section';
        ordersSection.id = 'orders-section';
        ordersSection.innerHTML = `
            <h2 class="menu-title">Suivi de vos commandes</h2>
            <div id="orders-container">
                <p id="no-orders-message" style="text-align: center; color: var(--text-secondary);">Vous n'avez pas encore passé de commande</p>
            </div>
        `;

        // Insérer la section dans le conteneur principal
        const container = document.querySelector('.container');
        container.appendChild(ordersSection);
    }

    loadOrders() {
        const ordersContainer = document.getElementById('orders-container');
        const noOrdersMessage = document.getElementById('no-orders-message');

        if (this.orders.length === 0) {
            if (noOrdersMessage) noOrdersMessage.style.display = 'block';
            return;
        }

        if (noOrdersMessage) noOrdersMessage.style.display = 'none';

        // Vider le conteneur avant de recharger les commandes
        ordersContainer.innerHTML = '';

        // Afficher les commandes du plus récent au plus ancien
        this.orders.slice().reverse().forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.className = `order-card status-${order.status}`;
            orderCard.id = `order-${order.id}`;

            const statusInfo = this.getStatusInfo(order.status);
            
            orderCard.innerHTML = `
                <div class="order-header">
                    <div class="order-info">
                        <h3>Commande #${order.id}</h3>
                        <p>Passée le ${new Date(order.date).toLocaleString('fr-FR')}</p>
                        <p>Adresse: ${order.address}</p>
                    </div>
                    <div class="order-total">€${order.total.toFixed(2)}</div>
                </div>
                <div class="order-items">
                    ${order.items.map(item => `
                        <div class="order-item">
                            <span>${item.name} x${item.quantity}</span>
                            <span>€${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="order-status">
                    <div class="status-icon">${statusInfo.icon}</div>
                    <div class="status-progress">
                        <div class="status-bar">
                            <div class="status-bar-inner status-${order.status}" style="width: ${this.getProgressPercentage(order.status)}%"></div>
                        </div>
                        <div class="status-current">
                            <div class="status-label">${statusInfo.label}</div>
                        </div>
                    </div>
                </div>
            `;
            
            ordersContainer.appendChild(orderCard);
        });
    }

    getStatusInfo(statusId) {
        const status = this.statuses.find(s => s.id === statusId);
        return status || { id: 'unknown', label: 'Statut inconnu', icon: '❓', time: 0 };
    }

    getProgressPercentage(statusId) {
        const index = this.statuses.findIndex(s => s.id === statusId);
        if (index === -1) return 0;
        return (index / (this.statuses.length - 1)) * 100;
    }

    async addOrder(order) {
        // Générer un ID unique basé sur la date
        const orderId = Date.now().toString().slice(-8);
        
        // Créer l'objet de commande
        const newOrder = {
            id: orderId,
            date: new Date().toISOString(),
            items: order.items,
            total: order.total,
            status: 'preparing',
            statusIndex: 0,
            customer: order.customer,
            address: order.address,
            instructions: order.instructions,
            phone: order.phone,
            deliveryTime: order.deliveryTime
        };

        // Ajouter la commande à la liste
        this.orders.push(newOrder);
        this.activeOrder = newOrder;
        
        // Sauvegarder et afficher les commandes
        this.saveOrders();
        this.loadOrders();

        // Afficher le suivi de progression en temps réel
        this.showProgressTracker();

        // Simuler la progression de la commande
        await this.simulateOrderProgress(orderId);

        return orderId;
    }

    showProgressTracker() {
        const progressTracker = document.getElementById('orders-progress-tracking');
        progressTracker.style.display = 'block';
        
        // Réinitialiser l'affichage
        document.querySelectorAll('.progress-step').forEach(step => {
            step.classList.remove('active', 'completed');
        });
        
        document.querySelectorAll('.progress-line').forEach(line => {
            line.classList.remove('active', 'completed');
        });
        
        // Activer uniquement la première étape
        const firstStep = document.querySelector('.progress-step[data-step="preparation"]');
        firstStep.classList.add('active');
        
        // Réinitialiser les textes et styles des statuts
        document.getElementById('status-preparation').textContent = 'En cours';
        document.getElementById('status-preparation').style.color = 'var(--primary-color)';
        document.getElementById('status-preparation').style.fontWeight = 'bold';
        
        document.getElementById('status-delivery').textContent = 'En attente';
        document.getElementById('status-delivery').style.color = 'var(--text-secondary)';
        document.getElementById('status-delivery').style.fontWeight = 'normal';
        
        document.getElementById('status-delivered').textContent = 'En attente';
        document.getElementById('status-delivered').style.color = 'var(--text-secondary)';
        document.getElementById('status-delivered').style.fontWeight = 'normal';
        
        // Initialiser la barre de progression à 0%
        document.getElementById('progress-bar-inner').style.width = '0%';
        
        // Afficher le temps estimé
        const totalMinutes = Math.ceil((this.statuses[0].time + this.statuses[1].time) / 60000);
        document.getElementById('time-remaining').textContent = `${totalMinutes} minutes`;
        
        // Faire défiler vers le suivi de progression
        progressTracker.scrollIntoView({ behavior: 'smooth' });
    }

    updateProgressTracker(statusId, statusIndex) {
        // Mettre à jour les classes des étapes
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            if (index < statusIndex) {
                step.classList.remove('active');
                step.classList.add('completed');
            } else if (index === statusIndex) {
                step.classList.add('active');
                step.classList.remove('completed');
            } else {
                step.classList.remove('active', 'completed');
            }
        });
        
        // Mettre à jour les lignes de progression
        document.querySelectorAll('.progress-line').forEach((line, index) => {
            if (index < statusIndex) {
                line.classList.remove('active');
                line.classList.add('completed');
            } else if (index === statusIndex) {
                line.classList.add('active');
                line.classList.remove('completed');
            } else {
                line.classList.remove('active', 'completed');
            }
        });
        
        // Mettre à jour les textes de statut
        const statuses = ['preparation', 'delivery', 'delivered'];
        statuses.forEach((status, index) => {
            const statusElement = document.getElementById(`status-${status}`);
            if (index < statusIndex) {
                statusElement.textContent = 'Terminé';
                statusElement.style.color = 'var(--secondary-color)';
            } else if (index === statusIndex) {
                statusElement.textContent = 'En cours';
                statusElement.style.color = 'var(--primary-color)';
                statusElement.style.fontWeight = 'bold';
            } else {
                statusElement.textContent = 'En attente';
                statusElement.style.color = 'var(--text-secondary)';
                statusElement.style.fontWeight = 'normal';
            }
        });
        
        // Mettre à jour la barre de progression
        const progressPercentage = this.getProgressPercentage(statusId);
        document.getElementById('progress-bar-inner').style.width = `${progressPercentage}%`;
        
        // Mettre à jour le temps estimé
        if (statusIndex < this.statuses.length - 1) {
            const remainingTime = this.statuses.slice(statusIndex).reduce((sum, s) => sum + s.time, 0);
            const minutes = Math.ceil(remainingTime / 60000);
            document.getElementById('time-remaining').textContent = `${minutes} minute${minutes > 1 ? 's' : ''}`;
        } else {
            document.getElementById('time-remaining').textContent = 'Livré !';
        }
    }

    async simulateOrderProgress(orderId) {
        console.log(`🔄 Simulation de la progression de la commande #${orderId}`);
        
        // Trouver la commande
        const orderIndex = this.orders.findIndex(o => o.id === orderId);
        if (orderIndex === -1) return;

        // Commencer par l'étape de préparation (la première étape est déjà activée par showProgressTracker)
        // Attendre un peu avant de passer à l'étape suivante
        await new Promise(resolve => setTimeout(resolve, this.statuses[0].time));
        
        // Simuler chaque étape restante
        for (let i = 1; i < this.statuses.length; i++) {
            const status = this.statuses[i];
            
            // Mettre à jour le statut dans les données
            this.orders[orderIndex].status = status.id;
            this.orders[orderIndex].statusIndex = i;
            this.saveOrders();
            this.loadOrders();
            
            // Mettre à jour le tracker en temps réel
            this.updateProgressTracker(status.id, i);

            console.log(`📦 Commande #${orderId} - Statut: ${status.label}`);
            
            // Attendre le temps défini pour ce statut
            if (status.time > 0) {
                await new Promise(resolve => setTimeout(resolve, status.time));
            }
        }

        console.log(`✅ Progression de la commande #${orderId} terminée`);
        
        // Cacher le tracker après un délai
        setTimeout(() => {
            document.getElementById('orders-progress-tracking').style.display = 'none';
        }, 10000);
    }

    saveOrders() {
        localStorage.setItem('userOrders', JSON.stringify(this.orders));
    }

    clearOrders() {
        this.orders = [];
        this.saveOrders();
        this.loadOrders();
    }

    getOrderById(orderId) {
        return this.orders.find(o => o.id === orderId);
    }
}

// Exporter pour utilisation globale
window.orderTracker = null;

document.addEventListener('DOMContentLoaded', () => {
    window.orderTracker = new OrderTracker();
});
