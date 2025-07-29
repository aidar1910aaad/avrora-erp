from .models import Product
from .serializers import ProductSerializer
from shared.api.base_table import BaseTableAPIView

class ProductTableView(BaseTableAPIView):
    serializer_class = ProductSerializer
    queryset = Product.objects.all()
