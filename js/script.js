    // Balance Manager Class
    class BalanceManager {
        constructor() {
            this.balance = parseFloat(localStorage.getItem('userBalance')) || 50; // Solde initial de démonstration
            this.transactions = JSON.parse(localStorage.getItem('userTransactions')) || [];
            this.init();
        }

        init() {
            this.createBalanceWidget();
            this.createBalanceModal();
            this.updateBalanceDisplay();
            this.bindEvents();
        }

        createBalanceWidget() {
            const balanceWidget = document.createElement('div');
            balanceWidget.className = 'balance-widget';
            balanceWidget.innerHTML = `
                <div class="balance-label">Votre solde</div>
                <div class="balance-amount" id="balance-display">€${this.balance.toFixed(2)}</div>
                <div class="balance-actions">
                    <button class="balance-btn" onclick="balanceManager.openCreditModal()">
                        💳 Ajouter crédit
                    </button>
                    <button class="balance-btn" onclick="balanceManager.openHistoryModal()">
                        📋 Historique
                    </button>
                    <button class="balance-btn" onclick="balanceManager.exportData()">
                        📊 Exporter
                    </button>
                </div>
            `;

            const container = document.querySelector('.container');
            const header = container.querySelector('.header');
            container.insertBefore(balanceWidget, header.nextSibling);
        }

        createBalanceModal() {
            const modal = document.createElement('div');
            modal.id = 'balance-modal';
            modal.className = 'balance-modal';
            modal.innerHTML = `
                <div class="balance-modal-content">
                    <span class="balance-close" onclick="balanceManager.closeModal()">&times;</span>
                    <div id="modal-content"></div>
                </div>
            `;
            document.body.appendChild(modal);
        }

        bindEvents() {
            document.getElementById('balance-modal').addEventListener('click', (e) => {
                if (e.target.id === 'balance-modal') {
                    this.closeModal();
                }
            });

            // Écouter les touches Escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.closeModal();
                }
            });
        }

        openCreditModal(suggestedAmount = null) {
            const modalContent = document.getElementById('modal-content');
            modalContent.innerHTML = `
                <h2>💳 Ajouter du crédit</h2>
                <div id="balance-alert-container"></div>
                <form class="balance-form" onsubmit="balanceManager.addCredit(event)">
                    <div class="balance-form-group">
                        <label>Montant (€)</label>
                        <input type="number" id="credit-amount" step="0.01" min="0.01" 
                                value="${suggestedAmount ? Math.ceil(suggestedAmount) : ''}" required>
                    </div>
                    <div class="balance-form-group">
                        <label>Description (optionnel)</label>
                        <input type="text" id="credit-description" placeholder="Ajout de crédit">
                    </div>
                    <div class="quick-amounts">
                        <button type="button" onclick="balanceManager.setQuickAmount(10)" class="quick-amount-btn">+10€</button>
                        <button type="button" onclick="balanceManager.setQuickAmount(20)" class="quick-amount-btn">+20€</button>
                        <button type="button" onclick="balanceManager.setQuickAmount(50)" class="quick-amount-btn">+50€</button>
                        <button type="button" onclick="balanceManager.setQuickAmount(100)" class="quick-amount-btn">+100€</button>
                    </div>
                    <button type="submit" class="balance-submit-btn">Ajouter le crédit</button>
                </form>
            `;
            this.openModal();
        }

        openHistoryModal() {
            const modalContent = document.getElementById('modal-content');
            const stats = this.calculateStats();
            
            const historyHtml = this.transactions.length === 0 ? 
                '<p style="text-align: center; color: #666; padding: 20px;">Aucune transaction</p>' :
                this.transactions.slice(0, 20).map(t => `
                    <div class="transaction-item transaction-${t.type}">
                        <div class="transaction-info">
                            <div class="transaction-description">${t.description}</div>
                            <div class="transaction-date">
                                ${new Date(t.date).toLocaleString('fr-FR')}
                            </div>
                        </div>
                        <div class="transaction-amount ${t.type}">
                            ${t.type === 'credit' ? '+' : '-'}€${t.amount.toFixed(2)}
                        </div>
                    </div>
                `).join('');

            modalContent.innerHTML = `
                <h2>📋 Historique des transactions</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; margin: 20px 0; text-align: center;">
                    <div>
                        <div style="font-size: 1.5em; font-weight: bold; color: #667eea;">€${this.balance.toFixed(2)}</div>
                        <div style="font-size: 0.9em; color: #666;">Solde actuel</div>
                    </div>
                    <div>
                        <div style="font-size: 1.5em; font-weight: bold; color: #27ae60;">€${stats.totalCredits.toFixed(2)}</div>
                        <div style="font-size: 0.9em; color: #666;">Total crédits</div>
                    </div>
                    <div>
                        <div style="font-size: 1.5em; font-weight: bold; color: #e74c3c;">€${stats.totalDebits.toFixed(2)}</div>
                        <div style="font-size: 0.9em; color: #666;">Total débits</div>
                    </div>
                    <div>
                        <div style="font-size: 1.5em; font-weight: bold; color: #667eea;">${this.transactions.length}</div>
                        <div style="font-size: 0.9em; color: #666;">Transactions</div>
                    </div>
                </div>
                <div class="transaction-history">
                    ${historyHtml}
                </div>
            `;
            this.openModal();
        }

        calculateStats() {
            const totalCredits = this.transactions
                .filter(t => t.type === 'credit')
                .reduce((sum, t) => sum + t.amount, 0);

            const totalDebits = this.transactions
                .filter(t => t.type === 'debit')
                .reduce((sum, t) => sum + t.amount, 0);

            return { totalCredits, totalDebits };
        }

        setQuickAmount(amount) {
            document.getElementById('credit-amount').value = amount;
        }

        addCredit(event) {
            event.preventDefault();
            const amount = parseFloat(document.getElementById('credit-amount').value);
            const description = document.getElementById('credit-description').value || 'Ajout de crédit';

            if (amount <= 0) {
                this.showModalAlert('Le montant doit être positif', 'error');
                return;
            }

            this.balance += amount;
            this.addTransaction('credit', amount, description);
            this.saveData();
            this.updateBalanceDisplay();
            
            this.showModalAlert(`Crédit de €${amount.toFixed(2)} ajouté avec succès!`, 'success');
            
            setTimeout(() => {
                this.closeModal();
            }, 2000);
        }

        debitBalance(amount, description) {
            if (this.balance < amount) {
                return false;
            }

            this.balance -= amount;
            this.addTransaction('debit', amount, description);
            this.saveData();
            this.updateBalanceDisplay();
            return true;
        }

        addTransaction(type, amount, description) {
            const transaction = {
                id: Date.now(),
                type: type,
                amount: amount,
                description: description,
                date: new Date().toISOString(),
                balanceAfter: this.balance
            };

            this.transactions.unshift(transaction);
            
            if (this.transactions.length > 100) {
                this.transactions = this.transactions.slice(0, 100);
            }
        }

        updateBalanceDisplay() {
            const balanceDisplay = document.getElementById('balance-display');
            if (balanceDisplay) {
                balanceDisplay.textContent = `€${this.balance.toFixed(2)}`;
                
                const widget = balanceDisplay.closest('.balance-widget');
                widget.classList.remove('low-balance', 'medium-balance');
                
                if (this.balance < 10) {
                    widget.classList.add('low-balance');
                } else if (this.balance < 50) {
                    widget.classList.add('medium-balance');
                }
            }
        }

        processPurchase(amount, description) {
            if (this.balance < amount) {
                this.showInsufficientFunds(amount);
                return false;
            }

            if (confirm(`Confirmer l'achat de €${amount.toFixed(2)} ?\n\nDétail: ${description}\nSolde actuel: €${this.balance.toFixed(2)}\nSolde après achat: €${(this.balance - amount).toFixed(2)}`)) {
                const success = this.debitBalance(amount, description);
                if (success) {
                    this.showPurchaseSuccess(amount, description);
                    return true;
                }
            }
            return false;
        }

        showInsufficientFunds(amount) {
            const shortfall = amount - this.balance;
            alert(`❌ Solde insuffisant!\n\nMontant requis: €${amount.toFixed(2)}\nVotre solde: €${this.balance.toFixed(2)}\nMontant manquant: €${shortfall.toFixed(2)}\n\nVoulez-vous ajouter du crédit ?`);
            
            setTimeout(() => {
                this.openCreditModal(shortfall);
            }, 500);
        }

        showPurchaseSuccess(amount, description) {
            alert(`✅ Achat effectué avec succès!\n\n${description}\nMontant: €${amount.toFixed(2)}\nNouveau solde: €${this.balance.toFixed(2)}`);
        }

        openModal() {
            document.getElementById('balance-modal').style.display = 'block';
            document.body.style.overflow = 'hidden';
        }

        closeModal() {
            document.getElementById('balance-modal').style.display = 'none';
            document.body.style.overflow = 'auto';
        }

        showModalAlert(message, type) {
            const container = document.getElementById('balance-alert-container');
            container.innerHTML = `<div class="balance-alert balance-alert-${type}">${message}</div>`;
            
            setTimeout(() => {
                container.innerHTML = '';
            }, 5000);
        }

        saveData() {
            localStorage.setItem('userBalance', this.balance.toString());
            localStorage.setItem('userTransactions', JSON.stringify(this.transactions));
        }

        getBalance() {
            return this.balance;
        }

        hasEnoughBalance(amount) {
            return this.balance >= amount;
        }

        exportData() {
            const data = {
                balance: this.balance,
                transactions: this.transactions,
                exportDate: new Date().toISOString(),
                stats: this.calculateStats()
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `food-truck-balance-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }
    }

    // Shopping Cart Class
    class ShoppingCart {
        constructor() {
            this.items = [];
            this.init();
        }

        init() {
            this.bindEvents();
            this.updateDisplay();
        }

        bindEvents() {
            // Boutons d'ajout au panier
            document.querySelectorAll('.buy-btn[data-price]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const price = parseFloat(e.target.dataset.price);
                    const item = e.target.dataset.item;
                    this.addItem(item, price);
                });
            });

            // Bouton de checkout
            document.getElementById('checkout-btn').addEventListener('click', () => {
                this.showCheckoutForm();
            });

            // Formulaire client
            document.getElementById('customer-form').addEventListener('submit', (e) => {
                e.preventDefault();
                this.processOrder();
            });
        }

        addItem(name, price) {
            const existingItem = this.items.find(item => item.name === name);
            
            if (existingItem) {
                existingItem.quantity++;
            } else {
                this.items.push({
                    name: name,
                    price: price,
                    quantity: 1
                });
            }

            this.updateDisplay();
            this.showAddedToCartMessage(name);
        }

        removeItem(index) {
            this.items.splice(index, 1);
            this.updateDisplay();
        }

        updateQuantity(index, newQuantity) {
            if (newQuantity <= 0) {
                this.removeItem(index);
            } else {
                this.items[index].quantity = newQuantity;
                this.updateDisplay();
            }
        }

        updateDisplay() {
            const cartContainer = document.getElementById('cart-items');
            const totalElement = document.getElementById('cart-total');
            const finalTotalElement = document.getElementById('final-total');
            const checkoutBtn = document.getElementById('checkout-btn');

            if (this.items.length === 0) {
                cartContainer.innerHTML = '<p style="text-align: center; color: #666;">Votre panier est vide</p>';
                checkoutBtn.disabled = true;
                checkoutBtn.textContent = 'Finaliser la commande';
            } else {
                const itemsHtml = this.items.map((item, index) => `
                    <div class="cart-item">
                        <div>
                            <strong>${item.name}</strong>
                            <div style="color: #666; font-size: 0.9em;">€${item.price.toFixed(2)} chacun</div>
                        </div>
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="cart.updateQuantity(${index}, ${item.quantity - 1})">-</button>
                            <span style="margin: 0 10px; font-weight: bold;">${item.quantity}</span>
                            <button class="quantity-btn" onclick="cart.updateQuantity(${index}, ${item.quantity + 1})">+</button>
                            <button class="remove-btn" onclick="cart.removeItem(${index})">Supprimer</button>
                        </div>
                        <div style="font-weight: bold; color: #667eea;">
                            €${(item.price * item.quantity).toFixed(2)}
                        </div>
                    </div>
                `).join('');

                cartContainer.innerHTML = itemsHtml;
                checkoutBtn.disabled = false;
                
                const total = this.getTotal();
                const hasEnoughFunds = balanceManager.hasEnoughBalance(total);
                
                checkoutBtn.className = hasEnoughFunds ? 'buy-btn sufficient-funds' : 'buy-btn insufficient-funds';
                checkoutBtn.textContent = hasEnoughFunds ? 
                    'Finaliser la commande' : 
                    `Solde insuffisant (manque €${(total - balanceManager.getBalance()).toFixed(2)})`;
            }

            const total = this.getTotal();
            totalElement.textContent = total.toFixed(2);
            if (finalTotalElement) {
                finalTotalElement.textContent = total.toFixed(2);
            }
        }

        getTotal() {
            return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        }

        showCheckoutForm() {
            const total = this.getTotal();
            
            if (!balanceManager.hasEnoughBalance(total)) {
                balanceManager.showInsufficientFunds(total);
                return;
            }

            document.getElementById('customer-form').style.display = 'block';
            document.getElementById('customer-form').scrollIntoView({ behavior: 'smooth' });
        }

        processOrder() {
            const total = this.getTotal();
            const customerName = document.getElementById('customer-name').value;
            const customerPhone = document.getElementById('customer-phone').value;
            const customerAddress = document.getElementById('customer-address').value;
            const deliveryTime = document.getElementById('delivery-time').value;
            const specialInstructions = document.getElementById('special-instructions').value;

            const orderSummary = this.items.map(item => 
                `${item.name} x${item.quantity} = €${(item.price * item.quantity).toFixed(2)}`
            ).join('\n');

            const orderDescription = `Commande Food Truck\n${orderSummary}\nClient: ${customerName}`;

            if (balanceManager.processPurchase(total, orderDescription)) {
                this.showOrderConfirmation({
                    orderNumber: Date.now(),
                    customerName,
                    customerPhone,
                    customerAddress,
                    deliveryTime,
                    specialInstructions,
                    items: [...this.items],
                    total
                });

                // Réinitialiser le panier
                this.items = [];
                this.updateDisplay();
                document.getElementById('customer-form').style.display = 'none';
                document.getElementById('customer-form').reset();
            }
        }

        showOrderConfirmation(order) {
            const modalContent = document.getElementById('modal-content');
            modalContent.innerHTML = `
                <h2>✅ Commande confirmée!</h2>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <p><strong>Numéro de commande:</strong> #${order.orderNumber}</p>
                    <p><strong>Client:</strong> ${order.customerName}</p>
                    <p><strong>Téléphone:</strong> ${order.customerPhone}</p>
                    <p><strong>Adresse:</strong> ${order.customerAddress}</p>
                    ${order.deliveryTime ? `<p><strong>Heure souhaitée:</strong> ${order.deliveryTime}</p>` : ''}
                    ${order.specialInstructions ? `<p><strong>Instructions:</strong> ${order.specialInstructions}</p>` : ''}
                </div>
                <div style="background: white; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <h4>Détail de la commande:</h4>
                    ${order.items.map(item => `
                        <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                            <span>${item.name} x${item.quantity}</span>
                            <span>€${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `).join('')}
                    <hr style="margin: 10px 0;">
                    <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.2em;">
                        <span>Total payé:</span>
                        <span>€${order.total.toFixed(2)}</span>
                    </div>
                </div>
                <p style="text-align: center; color: #666; margin: 20px 0;">
                    Votre commande sera préparée et livrée dans les meilleurs délais.<br>
                    Vous recevrez un SMS de confirmation.
                </p>
                <button onclick="balanceManager.closeModal()" class="balance-submit-btn">Fermer</button>
            `;
            balanceManager.openModal();
        }

        showAddedToCartMessage(itemName) {
            const message = document.createElement('div');
            message.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #27ae60;
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                font-weight: bold;
                z-index: 1001;
                animation: slideIn 0.3s ease;
            `;
            message.textContent = `✅ ${itemName} ajouté au panier!`;
            
            document.body.appendChild(message);
            
            setTimeout(() => {
                message.remove();
            }, 3000);
        }
    }

    // Initialize everything when DOM is loaded
    let balanceManager;
    let cart;

    document.addEventListener('DOMContentLoaded', () => {
        balanceManager = new BalanceManager();
        cart = new ShoppingCart();
        
        // Exposer globalement pour debug
        window.balanceManager = balanceManager;
        window.cart = cart;
        
        console.log('🚚 Food Truck App initialized!');
        console.log('💰 Solde initial:', balanceManager.getBalance());
    });

    // Utility functions
    function checkBalance() {
        return balanceManager.getBalance();
    }

    function hasEnoughFunds(amount) {
        return balanceManager.hasEnoughBalance(amount);
    }
