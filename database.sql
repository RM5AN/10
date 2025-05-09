
-- إضافة الأعمدة الناقصة إلى جدول المنتجات
ALTER TABLE products
ADD COLUMN quantity INT DEFAULT 0,
ADD COLUMN weight DECIMAL(10,2) DEFAULT 0.0,
ADD COLUMN dimensions VARCHAR(255) DEFAULT 'غير محدد';

-- إضافة تصنيفات جديدة إذا كانت غير موجودة
INSERT INTO categories (name, description)
SELECT * FROM (SELECT 'كاميرات', 'أحدث الكاميرات من جميع العلامات التجارية') AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE name = 'كاميرات'
) LIMIT 1;

INSERT INTO categories (name, description)
SELECT * FROM (SELECT 'عدسات', 'عدسات عالية الجودة لجميع الكاميرات') AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE name = 'عدسات'
) LIMIT 1;

INSERT INTO categories (name, description)
SELECT * FROM (SELECT 'إكسسوارات', 'إكسسوارات كاميرا مثل الحوامل، البطاريات، إلخ') AS tmp
WHERE NOT EXISTS (
    SELECT 1 FROM categories WHERE name = 'إكسسوارات'
) LIMIT 1;

-- ربط المنتجات بالتصنيفات المناسبة
UPDATE products
SET category_id = (SELECT id FROM categories WHERE name = 'كاميرات')
WHERE category = 'كاميرات';

UPDATE products
SET category_id = (SELECT id FROM categories WHERE name = 'عدسات')
WHERE category = 'عدسات';

UPDATE products
SET category_id = (SELECT id FROM categories WHERE name = 'إكسسوارات')
WHERE category = 'إكسسوارات';

-- تحديث البيانات الإضافية مثل الكمية والوزن والأبعاد
UPDATE products
SET quantity = 10, weight = 1.5, dimensions = '10x10x5'
WHERE id = 1;

UPDATE products
SET quantity = 5, weight = 0.8, dimensions = '7x7x3'
WHERE id = 2;

UPDATE products
SET quantity = 15, weight = 2.0, dimensions = '12x12x6'
WHERE id = 3;

-- إضافة صور للمنتجات
INSERT INTO product_images (product_id, image_url) VALUES
(1, 'images/product1_1.jpg'),
(1, 'images/product1_2.jpg'),
(2, 'images/product2_1.jpg'),
(2, 'images/product2_2.jpg');
