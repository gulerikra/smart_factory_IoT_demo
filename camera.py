# # import cv2
# # import time

# # # Kamera bağlantısını başlat
# # cap = cv2.VideoCapture(0)

# # # Sayacı başlat
# # counter = 0

# # while True:
# #     # Kamera görüntüsünü oku
# #     ret, frame = cap.read()

# #     # Görüntüyü diske kaydet
# #     cv2.imwrite("public/image.jpg", frame)

# #     # 3 saniye bekle
# #     time.sleep(3)

# # # Kamera bağlantısını kapat
# # cap.release()


# import cv2  # OpenCV kütüphanesi
# import numpy as np  # NumPy kütüphanesi
# import urllib.request  # URL'leri açmak için kullanılan kütüphane

# url = 'http://192.168.43.151/'  # IP adresi
# # cv2.namedWindow("live transmission", cv2.WINDOW_AUTOSIZE)  # Görüntü penceresi oluşturma

# counter = 0  # Counter başlangıç değeri
# while True:
#     if counter == 0 or counter % 3 == 0:  # Her üç turda bir kameradan görüntü al
#         img_resp = urllib.request.urlopen(url + 'cam-hi.jpg')  # URL'den görüntü al
#         imgnp = np.array(bytearray(img_resp.read()), dtype=np.uint8)  # NumPy dizisine dönüştür
#         frame = cv2.imdecode(imgnp, -1)  # Görüntüyü çözümle

#         cv2.imwrite('public/image.jpg', frame)  # Görüntüyü kaydet

#         # cv2.imshow("live transmission", frame)  # Görüntüyü göster
#         key = cv2.waitKey(1)
#         if key == 27:  # ESC tuşuna basılırsa döngüyü sonlandır
#             break
#         counter += 1  # Counter değerini bir artır

#     else:
#         counter += 1  # Counter değerini bir artır

# cv2.destroyAllWindows()  


# Görüntüyü kapat
import cv2
import numpy as np
import urllib.request

# IP adresini ve pencere adını tanımla
url = 'http://192.168.43.151/'
cv2.namedWindow("live transmission", cv2.WINDOW_AUTOSIZE)

# kare sayacını tanımla
counter = 0

while True:
    # her 3 karede bir kameradan görüntü al ve resim kaydet
    if counter == 0 or counter % 3 == 0:
        img_resp = urllib.request.urlopen(url + 'cam-hi.jpg')
        imgnp = np.array(bytearray(img_resp.read()), dtype=np.uint8)
        frame = cv2.imdecode(imgnp, -1)

        # RGB görüntüyü HSV renk uzayına dönüştür
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)

        # Mavi renk aralığı
        lower_blue = np.array([0, 50, 50])
        upper_blue = np.array([10, 255, 255])

        # Mavi renk alanlarını bul
        mask = cv2.inRange(hsv, lower_blue, upper_blue)

        # Mavi renk algılandıysa bounding box çiz ve resim kaydet
        if np.sum(mask) > 10000:
            contours, _ = cv2.findContours(mask, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
            for contour in contours:
                x, y, w, h = cv2.boundingRect(contour)
                cv2.rectangle(frame, (x, y), (x + w, y + h), (255, 0, 0), 2)
                cv2.imwrite('public/image.jpg', frame)

        # Görüntüyü ekranda göster
        cv2.imshow("live transmission", frame)
        key = cv2.waitKey(1)
        if key == 27:
            break
        counter += 1

    # her iki karede bir görüntüyü sadece ekranda göster
    else:
        img_resp = urllib.request.urlopen(url + 'cam-hi.jpg')
        imgnp = np.array(bytearray(img_resp.read()), dtype=np.uint8)
        frame = cv2.imdecode(imgnp, -1)
        cv2.imshow("live transmission", frame)
        key = cv2.waitKey(1)
        if key == 27:
            break
        counter += 1

# Tüm pencereleri kapat
cv2.destroyAllWindows()
