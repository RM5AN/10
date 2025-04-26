// وظائف عامة للموقع - السلة والمفضلة والبحث مع قاعدة بيانات Django
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة وظائف الموقع
    initializeCart();
    initializeWishlist();
    initializeSearch();
    
    // إضافة مستمعات الأحداث لجميع أزرار سلة التسوق
    document.querySelectorAll('.add-to-cart, .add-to-cart-btn, .cart-icon, .popup-cart').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // إضافة تأثير النبض للأيقونة
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.add('pulse');
                setTimeout(() => {
                    icon.classList.remove('pulse');
                }, 500);
            }

            // إذا كان زر السلة في الهيدر، انتقل إلى صفحة السلة
            if (this.classList.contains('cart-icon')) {
                window.location.href = 'cart.html';
                return;
            }

            // البحث عن البطاقة الأقرب
            const productCard = this.closest('.product-card, .camera-card, .popular-card');
            
            if (productCard) {
                // استخراج بيانات المنتج
                const productId = productCard.dataset.id || Math.floor(Math.random() * 10000);
                
                // إضافة المنتج للسلة عبر طلب Ajax إلى قاعدة البيانات
                addToCart(productId);
            }
        });
    });
    
    // إضافة مستمعات الأحداث لجميع أزرار المفضلة
    document.querySelectorAll('.wishlist-btn, .add-to-favorites-btn, .heart-icon, .popup-favorite').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // إضافة تأثير النبض للأيقونة
            const icon = this.querySelector('i');
            if (icon) {
                icon.classList.add('pulse');
                setTimeout(() => {
                    icon.classList.remove('pulse');
                }, 500);
            }

            // إذا كان زر المفضلة في الهيدر، انتقل إلى صفحة المفضلة
            if (this.classList.contains('heart-icon')) {
                window.location.href = 'favorites.html';
                return;
            }

            // البحث عن البطاقة الأقرب
            const productCard = this.closest('.product-card, .camera-card, .popular-card');
            
            if (productCard) {
                // استخراج بيانات المنتج
                const productId = productCard.dataset.id || Math.floor(Math.random() * 10000);
                
                // تبديل حالة المنتج في المفضلة عبر طلب Ajax إلى قاعدة البيانات
                toggleWishlist(productId, this);
            }
        });
    });
    
    // إضافة مستمع حدث للبحث
    const searchInput = document.querySelector('.search-container input');
    const searchIcon = document.querySelector('.search-icon');
    
    if (searchInput) {
        // إضافة حدث للبحث عند الضغط على Enter
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                const searchTerm = this.value.trim();
                if (searchTerm.length > 0) {
                    searchProducts(searchTerm);
                }
            }
        });
    }
    
    if (searchIcon && searchInput) {
        // إضافة حدث للبحث عند النقر على أيقونة البحث
        searchIcon.addEventListener('click', function() {
            const searchTerm = searchInput.value.trim();
            if (searchTerm.length > 0) {
                searchProducts(searchTerm);
            }
        });
    }
});

// وظائف السلة
function initializeCart() {
    // جلب عدد منتجات السلة من قاعدة البيانات
    fetchCartCount();
}

function addToCart(productId) {
    // إرسال طلب إضافة المنتج إلى السلة
    fetch('/api/cart/add/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({
            product_id: productId,
            quantity: 1
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('حدث خطأ أثناء إضافة المنتج للسلة');
        }
        return response.json();
    })
    .then(data => {
        // تحديث عدد منتجات السلة
        updateCartCount(data.cart_count);
        showToast('تمت إضافة المنتج إلى سلة التسوق', 'success', 'cart');
    })
    .catch(error => {
        console.error('خطأ:', error);
        showToast('حدث خطأ أثناء إضافة المنتج للسلة', 'error', 'error');
    });
}

function fetchCartCount() {
    // جلب عدد منتجات السلة
    fetch('/api/cart/count/')
    .then(response => {
        if (!response.ok) {
            throw new Error('حدث خطأ أثناء جلب عدد منتجات السلة');
        }
        return response.json();
    })
    .then(data => {
        updateCartCount(data.cart_count);
    })
    .catch(error => {
        console.error('خطأ:', error);
        // في حالة فشل الاتصال، نستخدم التخزين المحلي كبديل
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
        updateCartCount(cartCount);
    });
}

function updateCartCount(count) {
    // تحديث العداد في الواجهة
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(element => {
        element.textContent = count;
        element.style.display = count > 0 ? 'flex' : 'none';
    });
}

// وظائف المفضلة
function initializeWishlist() {
    // جلب عدد منتجات المفضلة من قاعدة البيانات
    fetchWishlistCount();
    
    // تحديث حالة أزرار المفضلة استنادًا إلى قاعدة البيانات
    updateWishlistButtons();
}

function toggleWishlist(productId, buttonElement) {
    // إرسال طلب تبديل حالة المنتج في المفضلة
    fetch('/api/wishlist/toggle/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCSRFToken()
        },
        body: JSON.stringify({
            product_id: productId
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('حدث خطأ أثناء تحديث المفضلة');
        }
        return response.json();
    })
    .then(data => {
        // تحديث عدد منتجات المفضلة
        updateWishlistCount(data.wishlist_count);
        
        // تحديث شكل زر المفضلة
        if (buttonElement) {
            const icon = buttonElement.querySelector('i');
            if (icon) {
                if (data.in_wishlist) {
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                    buttonElement.classList.add('active');
                    showToast('تمت إضافة المنتج إلى المفضلة', 'success', 'wishlist');
                } else {
                    icon.classList.remove('fas');
                    icon.classList.add('far');
                    buttonElement.classList.remove('active');
                    showToast('تمت إزالة المنتج من المفضلة', 'info', 'wishlist');
                }
            }
        }
    })
    .catch(error => {
        console.error('خطأ:', error);
        showToast('حدث خطأ أثناء تحديث المفضلة', 'error', 'error');
    });
}

function fetchWishlistCount() {
    // جلب عدد منتجات المفضلة
    fetch('/api/wishlist/count/')
    .then(response => {
        if (!response.ok) {
            throw new Error('حدث خطأ أثناء جلب عدد منتجات المفضلة');
        }
        return response.json();
    })
    .then(data => {
        updateWishlistCount(data.wishlist_count);
    })
    .catch(error => {
        console.error('خطأ:', error);
        // في حالة فشل الاتصال، نستخدم التخزين المحلي كبديل
        const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        updateWishlistCount(wishlist.length);
    });
}

function updateWishlistCount(count) {
    // تحديث العداد في الواجهة
    const wishlistCountElements = document.querySelectorAll('.wishlist-count');
    wishlistCountElements.forEach(element => {
        element.textContent = count;
        element.style.display = count > 0 ? 'flex' : 'none';
    });
}

function updateWishlistButtons() {
    // جلب قائمة منتجات المفضلة من قاعدة البيانات
    fetch('/api/wishlist/products/')
    .then(response => {
        if (!response.ok) {
            throw new Error('حدث خطأ أثناء جلب منتجات المفضلة');
        }
        return response.json();
    })
    .then(data => {
        // تحديث حالة أزرار المفضلة
        const productIds = data.products.map(product => product.id);
        
        document.querySelectorAll('.product-card, .camera-card, .popular-card').forEach(card => {
            const productId = card.dataset.id;
            if (!productId) return;
            
            const wishlistBtn = card.querySelector('.wishlist-btn, .add-to-favorites-btn');
            if (!wishlistBtn) return;
            
            const isInWishlist = productIds.includes(parseInt(productId));
            const icon = wishlistBtn.querySelector('i');
            
            if (isInWishlist) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                wishlistBtn.classList.add('active');
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                wishlistBtn.classList.remove('active');
            }
        });
    })
    .catch(error => {
        console.error('خطأ:', error);
        // في حالة فشل الاتصال، نستخدم التخزين المحلي كبديل
        const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        const productIds = wishlist.map(item => item.id);
        
        document.querySelectorAll('.product-card, .camera-card, .popular-card').forEach(card => {
            const productId = card.dataset.id;
            if (!productId) return;
            
            const wishlistBtn = card.querySelector('.wishlist-btn, .add-to-favorites-btn');
            if (!wishlistBtn) return;
            
            const isInWishlist = productIds.includes(productId);
            const icon = wishlistBtn.querySelector('i');
            
            if (isInWishlist) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                wishlistBtn.classList.add('active');
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                wishlistBtn.classList.remove('active');
            }
        });
    });
}

// وظيفة البحث
function initializeSearch() {
    // إضافة عنصر لعرض نتائج البحث إذا لم يكن موجودًا
    if (!document.querySelector('.search-results')) {
        const searchResultsDiv = document.createElement('div');
        searchResultsDiv.className = 'search-results';
        document.querySelector('.search-container')?.appendChild(searchResultsDiv);
    }
    
    // إضافة أنماط CSS إذا لم تكن موجودة
    if (!document.getElementById('search-results-styles')) {
        const style = document.createElement('style');
        style.id = 'search-results-styles';
        style.textContent = `
            .search-results {
                position: absolute;
                top: 100%;
                right: 0;
                width: 300px;
                max-height: 400px;
                overflow-y: auto;
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                z-index: 1000;
                display: none;
            }
            
            .search-results ul {
                list-style: none;
                padding: 0;
                margin: 0;
            }
            
            .search-results li {
                padding: 12px;
                border-bottom: 1px solid #eee;
                display: flex;
                align-items: center;
                gap: 10px;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            
            .search-results li:last-child {
                border-bottom: none;
            }
            
            .search-results li:hover {
                background-color: #f5f5f5;
            }
            
            .search-results img {
                width: 50px;
                height: 50px;
                object-fit: cover;
                border-radius: 4px;
            }
            
            .result-info {
                flex: 1;
            }
            
            .result-info h4 {
                margin: 0 0 5px;
                font-size: 14px;
                color: #333;
            }
            
            .result-info p {
                margin: 0;
                font-size: 13px;
                color: #165b8a;
                font-weight: bold;
            }
        `;
        document.head.appendChild(style);
    }
}

function searchProducts(searchTerm) {
    // البحث عن منتجات في قاعدة البيانات
    fetch(`/api/products/search/?q=${encodeURIComponent(searchTerm)}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('حدث خطأ أثناء البحث عن المنتجات');
        }
        return response.json();
    })
    .then(data => {
        showSearchResults(data.products);
    })
    .catch(error => {
        console.error('خطأ:', error);
        showToast('حدث خطأ أثناء البحث عن المنتجات', 'error', 'error');
        
        // في حالة فشل الاتصال، نعرض نتائج وهمية للتوضيح
        const dummyResults = [
            { id: 1, name: `كاميرا ${searchTerm}`, price: '1500', image: 'Fujifilm-X-T30 (1).jpg' },
            { id: 2, name: `عدسة ${searchTerm}`, price: '850', image: 'sigma 24-70 (1).jpg' },
            { id: 3, name: `ميكروفون ${searchTerm}`, price: '750', image: 'Rode VideoMic Pro (1).jpg' }
        ];
        
        showSearchResults(dummyResults);
    });
}

function showSearchResults(results) {
    let searchResults = document.querySelector('.search-results');
    
    // إنشاء حاوية النتائج إذا لم تكن موجودة
    if (!searchResults) {
        searchResults = document.createElement('div');
        searchResults.className = 'search-results';
        document.querySelector('.search-container').appendChild(searchResults);
    }
    
    // إنشاء محتوى نتائج البحث
    if (results.length === 0) {
        searchResults.innerHTML = '<div style="padding: 15px; text-align: center;">لا توجد نتائج</div>';
    } else {
        let resultsHTML = '<ul>';
        results.forEach(result => {
            resultsHTML += `
                <li data-id="${result.id}">
                    <img src="${result.image}" alt="${result.name}" onerror="this.src='https://via.placeholder.com/50'">
                    <div class="result-info">
                        <h4>${result.name}</h4>
                        <p>${result.price} ﷼</p>
                    </div>
                </li>
            `;
        });
        resultsHTML += '</ul>';
        searchResults.innerHTML = resultsHTML;
        
        // إضافة حدث النقر لكل نتيجة بحث
        searchResults.querySelectorAll('li').forEach(item => {
            item.addEventListener('click', function() {
                const productId = this.dataset.id;
                // الانتقال إلى صفحة المنتج المحدد
                window.location.href = `product.html?id=${productId}`;
            });
        });
    }
    
    // عرض نتائج البحث
    searchResults.style.display = 'block';
    
    // إضافة حدث لإغلاق نتائج البحث عند النقر خارجها
    document.addEventListener('click', function closeSearchResults(e) {
        const searchContainer = document.querySelector('.search-container');
        if (searchContainer && !searchContainer.contains(e.target)) {
            searchResults.style.display = 'none';
            document.removeEventListener('click', closeSearchResults);
        }
    });
}

// دالة الحصول على رمز CSRF للطلبات
function getCSRFToken() {
    // جلب رمز CSRF من ملفات تعريف الارتباط
    const value = `; ${document.cookie}`;
    const parts = value.split(`; csrftoken=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return '';
}

// وظائف الرسائل التنبيهية
function showToast(message, type = 'info', icon = 'info') {
    let iconClass = 'fas fa-info-circle';
    
    switch (icon) {
        case 'cart':
            iconClass = 'fas fa-shopping-cart';
            break;
        case 'wishlist':
            iconClass = 'fas fa-heart';
            break;
        case 'success':
            iconClass = 'fas fa-check-circle';
            break;
        case 'error':
            iconClass = 'fas fa-exclamation-circle';
            break;
        case 'search':
            iconClass = 'fas fa-search';
            break;
    }
    
    // التحقق من وجود حاوية الرسائل
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // إنشاء رسالة جديدة
    const toast = document.createElement('div');
    toast.className = `toast-message ${type}`;
    toast.innerHTML = `
        <i class="${iconClass}"></i>
        <span>${message}</span>
        <button class="toast-close"><i class="fas fa-times"></i></button>
    `;
    
    toastContainer.appendChild(toast);
    
    // عرض الرسالة
    setTimeout(() => toast.classList.add('show'), 10);
    
    // إضافة زر الإغلاق
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    });
    
    // إخفاء الرسالة تلقائيًا بعد 3 ثوانٍ
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
} 