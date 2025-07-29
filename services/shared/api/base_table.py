from rest_framework.views import APIView
from rest_framework.response import Response
from shared.utils.serializer_meta import get_serializer_fields_metadata


class BaseTableAPIView(APIView):
    serializer_class = None
    queryset = None

    def get(self, request):
        if self.serializer_class is None or self.queryset is None:
            return Response({"error": "serializer_class and queryset are required"}, status=500)

        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        columns = get_serializer_fields_metadata(self.serializer_class)

        return Response({
            "columns": columns,
            "rows": serializer.data
        })

    def get_queryset(self):
        return self.queryset.all()

    def get_serializer_class(self):
        return self.serializer_class

    def get_serializer(self, *args, **kwargs):
        serializer_class = self.get_serializer_class()
        return serializer_class(*args, **kwargs)
        
    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
