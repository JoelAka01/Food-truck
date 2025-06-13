<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Panier - Mini Food Truck</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="styles.css">
    <style>
        .cart-header {
            background: linear-gradient(135deg, #ff6b6b, #ffa500);
            color: white;
            padding: 2rem 0;
        }
        .cart-item {
            transition: all 0.3s ease;
            border: 1px solid #e9ecef;
        }
        .cart-item:hover {
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            transform: translateY(-2px);
        }
        .quantity-btn {
            width: 35px;
            height: 35px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .total-section {
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            border-radius: 15px;
            padding: 2rem;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }
        .checkout-btn {
            background: linear-gradient(135deg, #ff6b6b, #ffa500);
            border: none;
            padding: 1rem 2rem;
            font-size: 1.1rem;
            font-weight: bold;
            border-radius: 50px;
            transition: all 0.3s ease;
        }
        .checkout-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
        }
        .empty-cart {
            text-align: center;
            padding: 4rem 2rem;
            color: #6c757d;
        }
        .empty-cart i {
            font-size: 4rem;
            margin-bottom: 1rem;
            color: #dee2e6;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <header class="cart-header">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-md-6">
                    <h1><i class="fas fa-shopping-cart me-3"></i>Votre Panier</h1>
                    <p class="mb-0">Vérifiez vos articles avant de commander</p>
                </div>
                <div class="col-md-6 text-md-end">
                    <a href="index.html" class="btn btn-outline-light">
                        <i class="fas fa-arrow-left me-2"></i>Retour au menu
                    </a>
                </div>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <div class="container my-5">
        <div class="row">
            <!-- Cart Items -->
            <div class="col-lg-8">
                <div class="card shadow-sm">
                    <div class="card-header bg-white">
                        <h4 class="mb-0">
                            <i class="fas fa-utensils me-2 text-primary"></i>
                            Articles dans votre panier
                            <span id="cart-count" class="badge bg-primary ms-2">0</span>
                        </h4>
                    </div>
                    <div class="card-body">
                        <!-- Empty Cart Message -->
                        <div id="cart-empty" class="empty-cart">
                            <i class="fas fa-shopping-cart"></i>
                            <h3>Votre panier est vide</h3>
                            <p>Ajoutez des délicieux plats depuis notre menu</p>
                            <a href="index.html" class="btn btn-primary">
                                <i class="fas fa-utensils me-2"></i>Voir le menu
                            </a>
                        </div>

                        <!-- Cart Items Container -->
                        <div id="cart-items">
                            <!-- Items will be dynamically loaded here -->
                        </div>
                    </div>
                </div>

                <!-- Coupon Section -->
                <div class="card shadow-sm mt-4">
                    <div class="card-body">
                        <h5><i class="fas fa-ticket-alt me-2 text-success"></i>Code promo</h5>
                        <div class="row">
                            <div class="col-md-8">
                                <input type="text" id="coupon-code" class="form-control" placeholder="Entrez votre code promo">
                            </div>
                            <div class="col-md-4">
                                <button class="btn btn-outline-success w-100" onclick="applyCoupon()">
                                    <i class="fas fa-check me-1"></i>Appliquer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Order Summary -->
            <div class="col-lg-4">
                <div class="total-section sticky-top">
                    <h4 class="text-center mb-4">
                        <i class="fas fa-receipt me-2"></i>Récapitulatif
                    </h4>
                    
                    <div class="d-flex justify-content-between mb-3">
                        <span>Sous-total:</span>
                        <span id="subtotal">0.00 €</span>
                    </div>
                    
                    <div class="d-flex justify-content-between mb-3">
                        <span>TVA (10%):</span>
                        <span id="tax">0.00 €</span>
                    </div>
                    
                    <div class="d-flex justify-content-between mb-3" id="discount-row" style="display: none;">
                        <span class="text-success">Réduction:</span>
                        <span id="discount" class="text-success">-0.00 €</span>
                    </div>
                    
                    <div class="d-flex justify-content-between mb-3">
                        <span>Frais de livraison:</span>
                        <span id="delivery-fee">2.50 €</span>
                    </div>
                    
                    <hr>
                    
                    <div class="d-flex justify-content-between mb-4">
                        <strong>Total:</strong>
                        <strong id="total" class="text-primary fs-4">0.00 €</strong>
                    </div>
                    
                    <button id="order-btn" class="btn checkout-btn w-100 mb-3" disabled onclick="proceedToCheckout()">
                        <i class="fas fa-credit-card me-2"></i>
                        Procéder au paiement
                    </button>
                    
                    <div class="text-center">
                        <small class="text-muted">
                            <i class="fas fa-shield-alt me-1"></i>
                            Paiement 100% sécurisé
                        </small>
                    </div>
                    
                    <!-- Estimated Delivery Time -->
                    <div class="mt-4 p-3 bg-light rounded">
                        <h6><i class="fas fa-clock me-2 text-warning"></i>Temps de préparation</h6>
                        <p class="mb-0 text-muted">
                            <strong id="estimated-time">25-35 min</strong>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="script.js"></script>
    
    <script>
        // Initialize cart page
        document.addEventListener('DOMContentLoaded', function() {
            loadFromLocalStorage();
            updateCartUI();
        });

        // Apply coupon code
        function applyCoupon() {
            const couponCode = document.getElementById('coupon-code').value.trim().toLowerCase();
            const discountRow = document.getElementById('discount-row');
            const discountAmount = document.getElementById('discount');
            
            let discount = 0;
            
            switch(couponCode) {
                case 'welcome10':
                    discount = 0.10; // 10% discount
                    break;
                case 'student15':
                    discount = 0.15; // 15% discount
                    break;
                case 'first20':
                    discount = 0.20; // 20% discount
                    break;
                default:
                    alert('Code promo invalide');
                    return;
            }
            
            // Apply discount
            const totals = calculateTotals();
            const discountValue = totals.subtotal * discount;
            
            discountRow.style.display = 'flex';
            discountAmount.textContent = `-${discountValue.toFixed(2)} €`;
            
            // Update total with discount
            const newTotal = totals.total - discountValue + 2.50; // Add delivery fee
            document.getElementById('total').textContent = newTotal.toFixed(2) + ' €';
            
            // Success message
            alert(`Code promo appliqué! Vous économisez ${discountValue.toFixed(2)}€`);
            
            // Clear input
            document.getElementById('coupon-code').value = '';
        }

        // Proceed to checkout
        function proceedToCheckout() {
            if (cart.length === 0) {
                alert('Votre panier est vide');
                return;
            }
            
            // Save cart for checkout process
            saveToLocalStorage();
            
            // Redirect to checkout or show order summary
            showOrderSummary();
        }

        // Update estimated delivery time based on cart items
        function updateEstimatedTime() {
            const baseTime = 20; // Base preparation time
            const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
            const additionalTime = Math.floor(itemCount / 3) * 5; // 5 min per 3 items
            
            const minTime = baseTime + additionalTime;
            const maxTime = minTime + 10;
            
            document.getElementById('estimated-time').textContent = `${minTime}-${maxTime} min`;
        }

        // Override the updateCartUI function to include delivery fee and estimated time
        const originalUpdateCartUI = updateCartUI;
        updateCartUI = function() {
            originalUpdateCartUI();
            
            // Add delivery fee to total
            const totals = calculateTotals();
            const deliveryFee = cart.length > 0 ? 2.50 : 0;
            const finalTotal = totals.total + deliveryFee;
            
            document.getElementById('total').textContent = finalTotal.toFixed(2) + ' €';
            document.getElementById('delivery-fee').textContent = deliveryFee.toFixed(2) + ' €';
            
            // Update estimated time
            updateEstimatedTime();
        };
    </script>
</body>
</html>
