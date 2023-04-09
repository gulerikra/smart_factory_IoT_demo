# import cv2
# import time

# # Kamera bağlantısını başlat
# cap = cv2.VideoCapture(0)
# # Sayacı başlat
# counter = 0

# while True:
#     # Kamera görüntüsünü oku
#     ret, frame = cap.read()

#     # Görüntüyü diske kaydet
#     cv2.imwrite("public/image.jpg", frame)

#     # 3 saniye bekle
#     time.sleep(3)

# # Kamera bağlantısını kapat
# cap.release()

import cv2
import numpy as np
import urllib.request
import cv2
from ultralytics import YOLO # YOLOv5 modeli için ultralytics kütüphanesini kullanıyoruz
import datetime

#YOLOv5 modelinin çağrılması
model = YOLO("last.pt")

# IP adresi ile video akışı bağlantısı
url = 'http://192.168.43.151/'

# Video akışı için sonsuz bir döngü
while True:
# Video akışı alma
    img_resp = urllib.request.urlopen(url + 'cam-hi.jpg')
    imgnp = np.array(bytearray(img_resp.read()), dtype=np.uint8)
    kamera = cv2.imdecode(imgnp, -1)
    # Nesne tespiti işlemini gerçekleştirmek için görüntüyü model kullanarak işleme sokuyoruz
    de_out=model.predict(source=kamera, conf=0.2, show=True, device='cpu')

    # Nesne tespiti sonucunda en az bir nesne tespit edilmişse
    if len(de_out) != 0:
        isCompress = 0
        
        # Tüm tespit edilen nesneler için
        for i in range(len(de_out[0])):
            boxes = de_out[0].boxes
            box = boxes[i]
            clsID =boxes.cls.numpy()[0]
            conf = box.conf.numpy()[0]
            bb = box.xyxy.numpy()[0]
            print(datetime.datetime.now()) # Tespit anını yazdır
            print(clsID) # Tespit edilen nesnenin sınıfını yazdır
            
            # Eğer tespit edilen nesne bir ID'si '0' ise
            if clsID==0:
                cv2.imwrite('public/image.jpg', kamera) # Görüntüyü kaydet
