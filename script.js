// جعل المنتج ينبض عند اللمس
function pulseEffect(element) {
  element.style.animation = "pulse 0.3s ease-in-out";
  setTimeout(() => {
      element.style.animation = "";
  }, 300);
}

// تهيئة الرسائل التفاعلية
function initToasts() {
  if (!document.querySelector('.toast-container')) {
      const toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
  }

  const wishlistButtons = document.querySelectorAll('.wishlist-btn, .heart-icon, .favorite-btn');
  wishlistButtons.forEach(button => {
      button.removeEventListener('click', handleWishlistClick);
      button.addEventListener('click', handleWishlistClick);
  });

  const cartButtons = document.querySelectorAll('.add-to-cart, .cart-icon, .add-to-cart-btn');
  cartButtons.forEach(button => {
      button.removeEventListener('click', handleCartClick);
      button.addEventListener('click', handleCartClick);
  });
}

// معالج النقر على زر المفضلة
function handleWishlistClick(e) {
  if (!this.classList.contains('heart-icon')) {
      e.preventDefault();
  }

  const heartIcon = this.querySelector('i') || this;
  if (heartIcon.closest('.heart-icon')) {
      heartIcon.closest('.heart-icon').classList.add('pulse');
      setTimeout(() => {
          heartIcon.closest('.heart-icon').classList.remove('pulse');
      }, 500);
  }

  const productId = this.dataset.id;
  if (productId) {
      let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
      const icon = this.querySelector('.fa-heart');

      if (favorites.includes(productId)) {
          favorites = favorites.filter(id => id !== productId);
          icon.style.color = '#aaa';
      } else {
          favorites.push(productId);
          icon.style.color = 'red';
      }

      localStorage.setItem('favorites', JSON.stringify(favorites));
  }

  showToast('تمت إضافة المنتج إلى المفضلة', 'wishlist', 'fas fa-heart');
}

// معالج النقر على زر سلة التسوق
function handleCartClick(e) {
  if (!this.classList.contains('cart-icon')) {
      e.preventDefault();
  }

  const cartIcon = this.querySelector('i') || this;
  if (cartIcon.closest('.cart-icon')) {
      cartIcon.closest('.cart-icon').classList.add('pulse');
      setTimeout(() => {
          cartIcon.closest('.cart-icon').classList.remove('pulse');
      }, 500);
  }

  showToast('تمت إضافة المنتج إلى سلة التسوق', 'cart', 'fas fa-shopping-cart');
}

// دالة لعرض الرسائل التفاعلية
function showToast(message, type, icon) {
  const toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) return;

  const toast = document.createElement('div');
  toast.className = `toast-message ${type}`;
  toast.innerHTML = `
      <i class="${icon}"></i>
      <span>${message}</span>
      <button class="toast-close" aria-label="إغلاق">
          <i class="fas fa-times"></i>
      </button>
  `;

  const closeButton = toast.querySelector('.toast-close');
  closeButton.addEventListener('click', function () {
      toast.classList.remove('show');
      setTimeout(() => {
          toast.remove();
      }, 300);
  });

  toastContainer.appendChild(toast);

  setTimeout(() => {
      toast.classList.add('show');
  }, 10);

  setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
          toast.remove();
      }, 300);
  }, 3000);
}

document.addEventListener('DOMContentLoaded', () => {
  initToasts();


  const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  document.querySelectorAll('.favorite-btn').forEach(btn => {
      const icon = btn.querySelector('.fa-heart');
      if (favorites.includes(btn.dataset.id)) {
          icon.style.color = 'red';
      } else {
          icon.style.color = '#aaa';
      }
  });

  document.querySelectorAll('.fa-heart').forEach(icon => {
      icon.classList.remove('far');
      icon.classList.add('fas');
      icon.style.color = '#aaa';
  });

  document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
      btn.innerHTML = '<i class="fas fa-shopping-cart"></i>';
  });

  document.querySelectorAll('.product-popup').forEach(popup => popup.remove());

  document.querySelectorAll('.product-card').forEach(card => {
      if (!card.querySelector('.add-to-cart-btn')) {
          const cartBtn = document.createElement('button');
          cartBtn.className = 'add-to-cart-btn';
          cartBtn.innerHTML = '<i class="fas fa-shopping-cart"></i>';
          card.appendChild(cartBtn);
      }

      if (!card.querySelector('.favorite-btn')) {
          const favBtn = document.createElement('button');
          favBtn.className = 'favorite-btn';
          favBtn.dataset.id = card.dataset.id || '';
          favBtn.innerHTML = '<i class="fas fa-heart" style="color:#aaa"></i>';
          card.appendChild(favBtn);
      }
  });
});

const observer = new MutationObserver(() => {
  initToasts();
});
observer.observe(document.body, { childList: true, subtree: true });
