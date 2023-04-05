import cv2

# Kamera bağlantısını başlat
cap = cv2.VideoCapture(0)

# Kamera görüntüsünü oku
ret, frame = cap.read()

# Görüntüyü diske kaydet
cv2.imwrite("public/image.jpg", frame)

# Kamera bağlantısını kapat
cap.release()
