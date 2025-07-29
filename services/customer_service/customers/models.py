from django.db import models

class Customer(models.Model):
    name = models.CharField(max_length=100, verbose_name='Имя')
    email = models.EmailField(unique=True, verbose_name='Email')
    is_active = models.BooleanField(default=True, verbose_name='Активен')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')

    def __str__(self):
        return self.name
