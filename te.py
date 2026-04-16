import requests, socket
print(socket.getaddrinfo("google.com", 443))  # DNS works?
requests.get("https://google.com", timeout=5)  # Times out?