// سكريبت تنسيق الأسعار مع شعار الريال
document.addEventListener('DOMContentLoaded', function() {
    // أولاً: إزالة أي شعارات مكررة في قسم الأكثر شيوعاً
    const mostPopularProducts = document.querySelectorAll('.most-popular .product-card .price');
    mostPopularProducts.forEach(el => {
        // إذا كان هناك أكثر من عنصر .sar-symbol، نحتفظ بواحد فقط
        const symbols = el.querySelectorAll('.sar-symbol');
        if (symbols.length > 1) {
            // نحتفظ بالأول ونحذف الباقي
            for (let i = 1; i < symbols.length; i++) {
                symbols[i].remove();
            }
        }
    });

    // تحويل تنسيق الأسعار في الصفحة الحالية
    updatePriceFormat();
    
    // مراقبة التغييرات في DOM لتطبيق التنسيق على العناصر الجديدة
    const observer = new MutationObserver(function(mutations) {
        updatePriceFormat();
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    function updatePriceFormat() {
        // تحديد جميع عناصر الأسعار التي لم يتم تنسيقها بعد
        const priceElements = document.querySelectorAll('.price:not(.price-formatted), .product-price:not(.price-formatted), .cart-price:not(.price-formatted), .summary-price:not(.price-formatted), .total-price:not(.price-formatted)');
        
        priceElements.forEach(el => {
            // نتحقق إذا كان العنصر ليس جزءًا من قسم "الأكثر شيوعاً" وليس منسقًا من قبل
            if (!el.closest('.most-popular') && !el.classList.contains('price-formatted')) {
                // إعادة تنظيم المحتوى للتنسيق المطلوب
                const priceText = el.textContent.trim();
                
                // حفظ النص الأصلي بدون أي تنسيق
                const numericText = priceText.replace(/[^\d٠١٢٣٤٥٦٧٨٩]/g, '');
                
                // إفراغ المحتوى الحالي
                el.innerHTML = '';
                
                // إضافة رقم السعر
                const priceSpan = document.createElement('span');
                priceSpan.textContent = numericText;
                el.appendChild(priceSpan);
                
                // إضافة شعار الريال على يسار السعر
                const symbolSpan = document.createElement('span');
                symbolSpan.className = 'sar-symbol';
                el.appendChild(symbolSpan);
                
                // تطبيق التنسيق
                el.style.direction = 'ltr';
                el.style.display = 'flex';
                el.style.alignItems = 'center';
                el.style.justifyContent = 'center';
                
                // إضافة فئة للإشارة إلى أن العنصر تم تنسيقه
                el.classList.add('price-formatted');
            }
        });
    }
}); 