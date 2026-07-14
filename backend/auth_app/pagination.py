from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class CustomPagination(PageNumberPagination):
    page_size = 10  # تعداد آیتم در هر صفحه
    page_size_query_param = 'page_size'  # اختیاری (کاربر میتونه override کنه)

    def get_paginated_response(self, data):
        return Response({
            "data": data,
            "count": self.page.paginator.count,
            "totalPage": self.page.paginator.num_pages,
        })