from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from .models import FavoriteProduct

def add_to_cart(request):
    if request.method == 'POST':
        product_id = request.POST.get('product_id')
        product_name = request.POST.get('product_name')
        product_price = request.POST.get('product_price')
        product_image = request.POST.get('product_image')
        
        session = request.session
        
        # إضافة المنتج للسلة في الجلسة
        cart = session.get('cart', {})
        if product_id in cart:
            cart[product_id]['quantity'] += 1
        else:
            cart[product_id] = {
                'quantity': 1,
                'name': product_name,
                'price': product_price,
                'image': product_image
            }
        
        session['cart'] = cart
        session.modified = True
        
        return JsonResponse({
            'status': 'success', 
            'message': 'تمت إضافة المنتج إلى السلة',
            'cart_count': sum(item['quantity'] for item in cart.values())
        })
    return JsonResponse({'status': 'error'}, status=400)

def get_cart_count(request):
    session = request.session
    cart = session.get('cart', {})
    total_count = sum(item['quantity'] for item in cart.values())
    return JsonResponse({'count': total_count})

@login_required
def add_to_favorites(request):
    if request.method == 'POST':
        product_id = request.POST.get('product_id')
        try:
            FavoriteProduct.objects.get_or_create(
                user=request.user,
                product_id=product_id
            )
            return JsonResponse({'status': 'success', 'message': 'تمت إضافة المنتج إلى المفضلة'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)
    return JsonResponse({'status': 'error'}, status=400) 