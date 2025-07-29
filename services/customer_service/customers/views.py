from .models import Customer
from .serializers import CustomerSerializer
from shared.api.base_table import BaseTableAPIView

class CustomerTableView(BaseTableAPIView):
    serializer_class = CustomerSerializer
    queryset = Customer.objects.all()
