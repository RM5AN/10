let originalProducts = [];
let currentCategory = 'all';

document.addEventListener('DOMContentLoaded', function() {
    try {
        // انتظار تحميل جميع العناصر
        setTimeout(() => {
            const allProducts = document.querySelectorAll('.product-card, .camera-card');
            if (allProducts.length === 0) {
                console.log('لم يتم العثور على منتجات');
                return;
            }
            
            // التأكد من أن جميع المنتجات تحتوي على سمة data-operation
            allProducts.forEach(card => {
                // إذا لم تكن هناك سمة data-operation، نضيفها بناءً على وجود زر "استئجار" أو "شراء"
                if (!card.hasAttribute('data-operation')) {
                    const rentButton = card.querySelector('.rent-button, .add-to-rent');
                    const buyButton = card.querySelector('.buy-button, .add-to-cart');
                    
                    if (rentButton) {
                        card.setAttribute('data-operation', 'rent');
                    } else if (buyButton) {
                        card.setAttribute('data-operation', 'buy');
                    } else {
                        // إذا لم نجد أي زر، نفترض أنه منتج للشراء
                        card.setAttribute('data-operation', 'buy');
                    }
                }
                
                // التأكد من أن جميع المنتجات تحتوي على سمة data-category
                if (!card.hasAttribute('data-category')) {
                    // تحديد الفئة بناءً على نوع المنتج
                    if (card.classList.contains('camera-card')) {
                        card.setAttribute('data-category', 'cameras');
                    } else {
                        card.setAttribute('data-category', 'accessories');
                    }
                }
            });
            
            console.log('تم تهيئة سمات المنتجات');
            
            originalProducts = Array.from(allProducts).map(card => card.cloneNode(true));

            const filterCategory = document.getElementById('filter-category');
            const filterOperation = document.getElementById('filter-operation');
            const filterSort = document.getElementById('filter-sort');

            function applyFilters() {
                try {
                    const selectedCategory = filterCategory ? filterCategory.value : 'all';
                    currentCategory = selectedCategory; // حفظ الفئة المحددة حالياً
                    
                    const selectedOperation = filterOperation ? filterOperation.value : 'all';
                    const selectedSort = filterSort ? filterSort.value : 'default';

                    console.log('الفئة المحددة:', selectedCategory);
                    console.log('نوع العملية المحدد:', selectedOperation);

                    let filteredProducts = originalProducts.filter(card => {
                        // فلترة حسب الفئة
                        const matchesCategory = (selectedCategory === 'all') || (card.dataset.category === selectedCategory);
                        
                        // فلترة حسب نوع العملية (شراء/استئجار)
                        let matchesOperation = true;
                        if (selectedOperation !== 'all') {
                            // الحصول على نوع العملية من سمة data-operation
                            const operationType = card.getAttribute('data-operation') || '';
                            console.log('نوع العملية للمنتج:', operationType);
                            
                            if (selectedOperation === 'buy') {
                                // إذا تم اختيار "شراء"، نستبعد منتجات الاستئجار
                                matchesOperation = operationType !== 'rent';
                            } else if (selectedOperation === 'rent') {
                                // إذا تم اختيار "استئجار"، نعرض فقط منتجات الاستئجار
                                matchesOperation = operationType === 'rent';
                            }
                        }
                        
                        return matchesCategory && matchesOperation;
                    });

                    console.log('عدد المنتجات المفلترة:', filteredProducts.length);

                    if (selectedSort === 'high-to-low') {
                        filteredProducts.sort((a, b) => {
                            const priceA = parseFloat(a.querySelector('.price')?.textContent?.replace(/[^\d.]/g, '') || '0');
                            const priceB = parseFloat(b.querySelector('.price')?.textContent?.replace(/[^\d.]/g, '') || '0');
                            return priceB - priceA;
                        });
                    } else if (selectedSort === 'low-to-high') {
                        filteredProducts.sort((a, b) => {
                            const priceA = parseFloat(a.querySelector('.price')?.textContent?.replace(/[^\d.]/g, '') || '0');
                            const priceB = parseFloat(b.querySelector('.price')?.textContent?.replace(/[^\d.]/g, '') || '0');
                            return priceA - priceB;
                        });
                    }

                    showPage(1, filteredProducts);
                    updatePagination(filteredProducts, selectedCategory);
                } catch (error) {
                    console.error('خطأ في تطبيق الفلاتر:', error);
                }
            }

            if (filterCategory) filterCategory.addEventListener('change', applyFilters);
            if (filterOperation) filterOperation.addEventListener('change', applyFilters);
            if (filterSort) filterSort.addEventListener('change', applyFilters);

            applyFilters();
        }, 100);
    } catch (error) {
        console.error('خطأ في تهيئة صفحة المنتجات:', error);
    }
});

function showPage(page, visibleProducts) {
    const start = (page - 1) * 8;
    const end = start + 8;
    const productsToShow = visibleProducts.slice(start, end);

    console.log('عرض الصفحة:', page);
    console.log('عدد المنتجات في هذه الصفحة:', productsToShow.length);

    const productsGrid = document.querySelector('.products-grid, .product-grid, .cameras-grid');
    if (!productsGrid) {
        console.error('لم يتم العثور على عنصر شبكة المنتجات');
        return;
    }

    productsGrid.innerHTML = '';

    if (productsToShow.length === 0) {
        const noProductsMessage = document.createElement('div');
        noProductsMessage.textContent = 'لا توجد منتجات متاحة في هذه الصفحة';
        noProductsMessage.style.textAlign = 'center';
        noProductsMessage.style.marginTop = '20px';
        noProductsMessage.style.color = '#666';
        noProductsMessage.style.fontSize = '16px';
        productsGrid.appendChild(noProductsMessage);
        return;
    }

    productsToShow.forEach(card => {
        const clonedCard = card.cloneNode(true);
        productsGrid.appendChild(clonedCard);
    });
}

function updatePagination(visibleProducts, selectedCategory) {
    const pagination = document.querySelector('.pagination');
    if (!pagination) return;

    pagination.innerHTML = '';

    const productsPerPage = 8;
    const totalPages = Math.ceil(visibleProducts.length / productsPerPage);

    // إذا لم تكن هناك منتجات، نعرض رسالة
    if (visibleProducts.length === 0) {
        const noProductsMessage = document.createElement('div');
        noProductsMessage.textContent = 'لا توجد منتجات متاحة في هذه الفئة';
        noProductsMessage.style.textAlign = 'center';
        noProductsMessage.style.marginTop = '20px';
        noProductsMessage.style.color = '#666';
        noProductsMessage.style.fontSize = '16px';
        
        const productsGrid = document.querySelector('.products-grid, .product-grid, .cameras-grid');
        if (productsGrid) {
            productsGrid.innerHTML = '';
            productsGrid.appendChild(noProductsMessage);
        }
        return;
    }

    // إنشاء أزرار الترقيم
    for (let page = 1; page <= totalPages; page++) {
        const button = document.createElement('button');
        button.textContent = page;
        button.classList.add('page-btn');
        
        // حساب المنتجات في هذه الصفحة
        const startIndex = (page - 1) * productsPerPage;
        const pageProducts = visibleProducts.slice(startIndex, startIndex + productsPerPage);
        
        // التحقق مما إذا كانت الصفحة تحتوي على منتجات من الفئة المحددة
        const hasProductsInCategory = selectedCategory === 'all' || 
            pageProducts.some(product => product.dataset.category === selectedCategory);
        
        if (!hasProductsInCategory) {
            button.disabled = true;
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
        } else {
            button.addEventListener('click', function() {
                document.querySelectorAll('.page-btn').forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                showPage(page, visibleProducts);
            });
        }
        
        // تحديد الزر النشط
        if (page === 1) {
            button.classList.add('active');
        }

        pagination.appendChild(button);
    }
}
