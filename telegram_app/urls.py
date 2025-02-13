from django.urls import path
from .views import receive_data,index,success

urlpatterns = [
    path("", index , name="home"),  # Renders the HTML template
    path("send-data/", receive_data, name="send-data"),  # Handles AJAX requests
    path("success/", success, name="success"),  # Renders the success page
]
